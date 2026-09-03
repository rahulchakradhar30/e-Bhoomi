import os
import time
from datetime import datetime, timezone
from typing import Dict, List, Any
import numpy as np
from PIL import Image

from app.ocr.base_provider import BaseOCRProvider
from app.ocr.line_segmenter import LineSegmenter
from app.ocr.normalizer import TeluguNormalizer

class TeluguHandwrittenOCRProvider(BaseOCRProvider):
    """
    Server-Side Telugu Handwritten OCR Engine Provider.
    Candidate Adapter: CharanS247/got-ocr2-telugu-handwritten
    Base Model: stepfun-ai/GOT-OCR-2.0-hf
    Supports CPU/GPU auto-detection & lazy loading.
    Returns truthful status (COMPLETED / HANDWRITTEN_OCR_RESOURCE_UNAVAILABLE / OCR_MODEL_NOT_AVAILABLE / FAILED).
    """

    MODEL_ID = "CharanS247/got-ocr2-telugu-handwritten"
    BASE_MODEL_ID = "stepfun-ai/GOT-OCR-2.0-hf"

    def __init__(self):
        self.segmenter = LineSegmenter()
        self.normalizer = TeluguNormalizer()

        self.device = "cpu"
        self.model_loaded = False
        self.tokenizer = None
        self.model = None
        self.init_error = None

        self._initialize_model()

    def _initialize_model(self):
        """
        Lazy-loads HuggingFace GOT-OCR2 adapter for handwritten Telugu OCR.
        Gracefully handles missing weights, memory limits, or offline environments.
        """
        try:
            import torch
            from transformers import AutoTokenizer, AutoModelForCausalLM

            self.device = "cuda" if torch.cuda.is_available() else "cpu"
            cache_dir = os.getenv("MODEL_CACHE_DIR", None)

            # Initialize GOT-OCR2 tokenizer and base model adapter
            self.tokenizer = AutoTokenizer.from_pretrained(
                self.BASE_MODEL_ID, trust_remote_code=True, cache_dir=cache_dir
            )
            self.model = AutoModelForCausalLM.from_pretrained(
                self.MODEL_ID,
                trust_remote_code=True,
                cache_dir=cache_dir,
                low_cpu_mem_usage=True
            )
            self.model.to(self.device)
            self.model.eval()
            self.model_loaded = True
            print(f"[TeluguHandwrittenOCRProvider] Loaded '{self.MODEL_ID}' on {self.device}.")
        except Exception as err:
            self.model_loaded = False
            self.init_error = str(err)
            print(
                f"[TeluguHandwrittenOCRProvider] Model '{self.MODEL_ID}' not loaded on {self.device}. "
                f"Status: HANDWRITTEN_OCR_RESOURCE_UNAVAILABLE. Info: {err}"
            )

    def process_page_image(self, image_bgr: np.ndarray, page_number: int) -> Dict[str, Any]:
        """
        Processes a handwritten page or region crop.
        Returns HANDWRITTEN_OCR_RESOURCE_UNAVAILABLE if model weights are pending download.
        """
        start_time = time.time()

        if not self.model_loaded or self.tokenizer is None or self.model is None:
            return {
                "pageNumber": page_number,
                "status": "HANDWRITTEN_OCR_RESOURCE_UNAVAILABLE",
                "rawText": "",
                "normalizedText": "",
                "lines": [],
                "handwritingDetected": True,
                "errorMessage": (
                    f"Telugu Handwritten OCR adapter '{self.MODEL_ID}' is not initialized. "
                    f"Initialization note: {self.init_error or 'Weights pending download'}. "
                    "Printed Telugu OCR remains fully active."
                ),
            }

        try:
            import torch

            # 1. Segment region into text line crops
            line_items = self.segmenter.segment_lines(image_bgr)
            line_results = []
            raw_lines = []

            for item in line_items:
                crop_bgr = item["line_crop"]
                pil_img = Image.fromarray(crop_bgr[:, :, ::-1]).convert("RGB")

                # Process image through GOT-OCR2 model interface
                inputs = self.tokenizer(pil_img, return_tensors="pt").to(self.device)
                with torch.no_grad():
                    output_ids = self.model.generate(**inputs, max_new_tokens=64)

                line_text = self.tokenizer.decode(output_ids[0], skip_special_tokens=True)

                raw_lines.append(line_text)
                line_results.append({
                    "lineIndex": item["line_index"],
                    "lineText": line_text,
                    "boundingBox": item["bounding_box"]
                })

            raw_text = "\n".join(raw_lines)
            normalized_text = self.normalizer.normalize(raw_text)

            return {
                "pageNumber": page_number,
                "status": "COMPLETED",
                "rawText": raw_text,
                "normalizedText": normalized_text,
                "lines": line_results,
                "handwritingDetected": True,
                "processingTimeMs": int((time.time() - start_time) * 1000),
            }
        except Exception as err:
            return {
                "pageNumber": page_number,
                "status": "HANDWRITTEN_OCR_FAILED",
                "rawText": "",
                "normalizedText": "",
                "lines": [],
                "handwritingDetected": True,
                "errorMessage": f"Handwritten OCR line inference error: {str(err)}",
            }

    def process_document_images(self, pages_bgr: List[np.ndarray]) -> Dict[str, Any]:
        """
        Processes multi-page handwritten document images.
        """
        start_time = time.time()
        page_results = []
        overall_status = "COMPLETED"
        failed_count = 0

        for idx, img in enumerate(pages_bgr, start=1):
            page_res = self.process_page_image(img, idx)
            page_results.append(page_res)

            if page_res["status"] == "HANDWRITTEN_OCR_RESOURCE_UNAVAILABLE":
                overall_status = "HANDWRITTEN_OCR_RESOURCE_UNAVAILABLE"
            elif page_res["status"] != "COMPLETED":
                failed_count += 1

        if overall_status != "HANDWRITTEN_OCR_RESOURCE_UNAVAILABLE" and failed_count > 0:
            overall_status = "PARTIAL_FAILURE" if failed_count < len(pages_bgr) else "HANDWRITTEN_OCR_FAILED"

        full_raw = "\n\n".join(p.get("rawText", "") for p in page_results if p.get("rawText"))
        full_norm = "\n\n".join(p.get("normalizedText", "") for p in page_results if p.get("normalizedText"))

        return {
            "ocrId": f"OCR-HW-{int(time.time())}",
            "status": overall_status,
            "provider": "TeluguHandwrittenOCR",
            "model": self.MODEL_ID,
            "baseModel": self.BASE_MODEL_ID,
            "language": "te",
            "device": self.device,
            "pageCount": len(page_results),
            "pages": page_results,
            "rawOCRText": full_raw,
            "normalizedOCRText": full_norm,
            "processedAt": datetime.now(timezone.utc).isoformat(),
            "processingTimeMs": int((time.time() - start_time) * 1000),
        }

    def get_provider_metadata(self) -> Dict[str, Any]:
        return {
            "providerName": "TeluguHandwrittenOCRProvider",
            "modelIdentifier": self.MODEL_ID,
            "baseModelIdentifier": self.BASE_MODEL_ID,
            "supportedLanguages": ["te"],
            "device": self.device,
            "isModelLoaded": self.model_loaded,
            "initializationError": self.init_error,
        }
