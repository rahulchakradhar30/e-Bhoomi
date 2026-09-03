import time
from typing import Dict, List, Any
import numpy as np

from app.ocr.telugu_ocr_provider import TeluguOCRProvider
from app.ocr.telugu_handwritten_provider import TeluguHandwrittenOCRProvider
from app.ocr.handwriting_detector import HandwritingDetector
from app.ocr.normalizer import TeluguNormalizer

class OCRRegionRouter:
    """
    Intelligent Region Classification & OCR Provider Router.
    Routes PRINTED_TEXT → TeluguOCRProvider
    Routes HANDWRITTEN_TEXT → TeluguHandwrittenOCRProvider
    Preserves top-to-bottom reading order and region bounding boxes.
    """

    def __init__(self):
        self.printed_provider = TeluguOCRProvider()
        self.handwritten_provider = TeluguHandwrittenOCRProvider()
        self.detector = HandwritingDetector()
        self.normalizer = TeluguNormalizer()

    def process_document_with_region_routing(self, pages_bgr: List[np.ndarray]) -> Dict[str, Any]:
        start_time = time.time()
        page_results = []
        overall_status = "COMPLETED"
        has_handwriting_in_doc = False
        handwritten_unavailable = False

        for page_idx, img in enumerate(pages_bgr, start=1):
            regions = self.detector.analyze_page_regions(img)
            region_results = []
            page_raw_parts = []

            for reg in regions:
                r_type = reg["regionType"]
                bbox = reg["boundingBox"]
                x, y, w, h = bbox["x"], bbox["y"], bbox["width"], bbox["height"]
                crop = img[y:y+h, x:x+w]

                if r_type == "HANDWRITTEN_TEXT" or reg["isHandwritten"]:
                    has_handwriting_in_doc = True
                    hw_res = self.handwritten_provider.process_page_image(crop, page_idx)
                    
                    if hw_res["status"] == "HANDWRITTEN_OCR_RESOURCE_UNAVAILABLE":
                        handwritten_unavailable = True
                        provider_used = "TeluguHandwrittenOCRProvider"
                        raw_t = ""
                        norm_t = ""
                        r_status = "HANDWRITTEN_OCR_RESOURCE_UNAVAILABLE"
                    else:
                        provider_used = "TeluguHandwrittenOCRProvider"
                        raw_t = hw_res.get("rawText", "")
                        norm_t = hw_res.get("normalizedText", "")
                        r_status = hw_res.get("status", "COMPLETED")
                elif r_type in ["STAMP", "MAP_OR_DIAGRAM", "SIGNATURE"]:
                    # Preserve region visual metadata without forcing invalid OCR
                    provider_used = "PreservedRegion"
                    raw_t = ""
                    norm_t = ""
                    r_status = "PRESERVED"
                else:
                    # Default: Printed Telugu OCR Provider
                    printed_res = self.printed_provider.process_page_image(crop, page_idx)
                    provider_used = "TeluguOCRProvider"
                    raw_t = printed_res.get("rawText", "")
                    norm_t = printed_res.get("normalizedText", "")
                    r_status = printed_res.get("status", "COMPLETED")

                if raw_t:
                    page_raw_parts.append(raw_t)

                region_results.append({
                    "regionIndex": reg["regionIndex"],
                    "regionType": r_type,
                    "boundingBox": bbox,
                    "provider": provider_used,
                    "rawText": raw_t,
                    "normalizedText": norm_t,
                    "status": r_status,
                })

            page_raw = "\n".join(page_raw_parts)
            page_norm = self.normalizer.normalize(page_raw)

            page_results.append({
                "pageNumber": page_idx,
                "status": "OCR_PARTIAL" if handwritten_unavailable else "COMPLETED",
                "rawText": page_raw,
                "normalizedText": page_norm,
                "regions": region_results,
                "handwritingDetected": has_handwriting_in_doc,
            })

        if handwritten_unavailable:
            overall_status = "OCR_PARTIAL_HANDWRITING_UNAVAILABLE"

        full_raw = "\n\n".join(p["rawText"] for p in page_results if p["rawText"])
        full_norm = "\n\n".join(p["normalizedText"] for p in page_results if p["normalizedText"])

        return {
            "ocrId": f"OCR-MIX-{int(time.time())}",
            "status": overall_status,
            "provider": "TeluguOCRProvider + TeluguHandwrittenOCRProvider",
            "language": "te",
            "pageCount": len(page_results),
            "pages": page_results,
            "rawOCRText": full_raw,
            "normalizedOCRText": full_norm,
            "handwritingDetected": has_handwriting_in_doc,
            "overallStatus": "READY_FOR_LANGUAGE_PROCESSING",
            "processedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "processingTimeMs": int((time.time() - start_time) * 1000),
        }
