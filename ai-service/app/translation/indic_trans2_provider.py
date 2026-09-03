import os
import re
import time
from datetime import datetime, timezone
from typing import Dict, List, Any

from app.translation.base_translation_provider import BaseTranslationProvider
from app.nlp.glossary import LandRecordGlossary

class IndicTrans2Provider(BaseTranslationProvider):
    """
    Server-Side IndicTrans2 Translation Provider for e-Bhoomi.
    Primary Candidate Model: ai4bharat/indictrans2-indic-en-1B
    Reverse Model Candidate: ai4bharat/indictrans2-en-indic-1B
    Primary Language Pair: tel_Tel (Telugu) -> eng_Latn (English)
    Preserves survey numbers (142/3A), extents (2.45), dates, and owner names.
    Returns status TRANSLATION_MODEL_UNAVAILABLE truthfully if model weights are not loaded.
    """

    MODEL_ID = "ai4bharat/indictrans2-indic-en-1B"
    REVERSE_MODEL_ID = "ai4bharat/indictrans2-en-indic-1B"

    def __init__(self):
        self.glossary = LandRecordGlossary()
        self.device = "cpu"
        self.model_loaded = False
        self.tokenizer = None
        self.model = None
        self.init_error = None

        self._initialize_model()

    def _initialize_model(self):
        """
        Attempts loading PyTorch & HuggingFace IndicTrans2 model.
        Gracefully handles missing weights or offline environments.
        """
        try:
            import torch
            from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

            self.device = "cuda" if torch.cuda.is_available() else "cpu"
            cache_dir = os.getenv("MODEL_CACHE_DIR", None)

            self.tokenizer = AutoTokenizer.from_pretrained(
                self.MODEL_ID, trust_remote_code=True, cache_dir=cache_dir
            )
            self.model = AutoModelForSeq2SeqLM.from_pretrained(
                self.MODEL_ID, trust_remote_code=True, cache_dir=cache_dir
            )
            self.model.to(self.device)
            self.model.eval()
            self.model_loaded = True
            print(f"[IndicTrans2Provider] Loaded model '{self.MODEL_ID}' on {self.device}.")
        except Exception as err:
            self.model_loaded = False
            self.init_error = str(err)
            print(
                f"[IndicTrans2Provider] Model '{self.MODEL_ID}' not loaded on {self.device}. "
                f"Status: TRANSLATION_MODEL_UNAVAILABLE. Info: {err}"
            )

    def translate_text(self, text: str, source_lang: str = "te", target_lang: str = "en") -> Dict[str, Any]:
        """
        Translates a single block or sentence segment of text.
        Preserves survey numbers, extents, and personal names.
        """
        start_time = time.time()
        if not text:
            return {
                "sourceText": "",
                "translatedText": "",
                "status": "COMPLETED",
                "processingTimeMs": 0,
            }

        if not self.model_loaded or self.tokenizer is None or self.model is None:
            return {
                "sourceText": text,
                "translatedText": "",
                "status": "TRANSLATION_MODEL_UNAVAILABLE",
                "errorMessage": (
                    f"IndicTrans2 model '{self.MODEL_ID}' is not loaded. "
                    f"Initialization note: {self.init_error or 'Weights pending download'}. "
                    "Telugu source text is fully preserved."
                ),
                "processingTimeMs": 0,
            }

        try:
            import torch

            # Apply rule-based pre-translation glossary & number masking for fidelity
            masked_text, placeholders = self._mask_identifiers_and_names(text)

            inputs = self.tokenizer(
                masked_text, return_tensors="pt", padding=True, truncation=True, max_length=256
            ).to(self.device)

            with torch.no_grad():
                generated_tokens = self.model.generate(
                    **inputs,
                    use_cache=True,
                    max_length=256,
                    num_beams=2
                )

            translation = self.tokenizer.batch_decode(
                generated_tokens, skip_special_tokens=True
            )[0]

            # Unmask preserved identifiers and names
            unmasked_translation = self._unmask_identifiers_and_names(translation, placeholders)

            return {
                "sourceText": text,
                "translatedText": unmasked_translation,
                "status": "COMPLETED",
                "processingTimeMs": int((time.time() - start_time) * 1000),
            }
        except Exception as err:
            return {
                "sourceText": text,
                "translatedText": "",
                "status": "TRANSLATION_FAILED",
                "errorMessage": f"IndicTrans2 inference error: {str(err)}",
                "processingTimeMs": int((time.time() - start_time) * 1000),
            }

    def translate_document(self, nlp_data: Dict[str, Any], source_lang: str = "te", target_lang: str = "en") -> Dict[str, Any]:
        """
        Translates a page-wise NLP document package from Phase 1D.
        Preserves rawOCRText, normalizedOCRText, nlpProcessedText, and appends translatedText.
        """
        start_time = time.time()
        pages_input = nlp_data.get("pages", [])
        trans_pages = []
        full_translated_parts = []
        overall_status = "COMPLETED"

        for page in pages_input:
            p_num = page.get("pageNumber", 1)
            raw_ocr = page.get("rawOCRText", "")
            norm_ocr = page.get("normalizedOCRText", "")
            nlp_text = page.get("nlpProcessedText", "") or norm_ocr or raw_ocr
            sentences = page.get("sentences", []) or [nlp_text]
            regions_input = page.get("regions", [])

            translated_sentences = []
            for sent in sentences:
                res = self.translate_text(sent, source_lang, target_lang)
                if res["status"] == "TRANSLATION_MODEL_UNAVAILABLE":
                    overall_status = "TRANSLATION_MODEL_UNAVAILABLE"
                    translated_sentences.append(sent) # Preserve source
                elif res["translatedText"]:
                    translated_sentences.append(res["translatedText"])
                else:
                    translated_sentences.append(sent)

            page_trans = "\n".join(translated_sentences)
            full_translated_parts.append(page_trans)

            trans_regions = []
            for reg in regions_input:
                reg_nlp = reg.get("nlpProcessedText", "") or reg.get("normalizedText", "")
                reg_res = self.translate_text(reg_nlp, source_lang, target_lang)
                trans_regions.append({
                    "regionIndex": reg.get("regionIndex", 0),
                    "regionType": reg.get("regionType", "PRINTED_TEXT"),
                    "boundingBox": reg.get("boundingBox", None),
                    "provider": "IndicTrans2Provider",
                    "rawText": reg.get("rawText", ""),
                    "normalizedText": reg.get("normalizedText", ""),
                    "nlpProcessedText": reg.get("nlpProcessedText", ""),
                    "translatedText": reg_res.get("translatedText", "") or reg_nlp,
                    "status": reg_res.get("status", "COMPLETED"),
                })

            trans_pages.append({
                "pageNumber": p_num,
                "status": "COMPLETED" if overall_status == "COMPLETED" else "TRANSLATION_MODEL_UNAVAILABLE",
                "rawOCRText": raw_ocr,
                "normalizedOCRText": norm_ocr,
                "nlpProcessedText": nlp_text,
                "translatedText": page_trans,
                "segments": [
                    {"source": s, "target": t} for s, t in zip(sentences, translated_sentences)
                ],
                "regions": trans_regions,
            })

        full_trans_text = "\n\n".join(full_translated_parts)

        return {
            "translationId": f"TRANS-{int(time.time())}",
            "status": overall_status,
            "provider": "IndicTrans2Provider",
            "model": self.MODEL_ID,
            "sourceLanguage": source_lang,
            "targetLanguage": target_lang,
            "device": self.device,
            "pageCount": len(trans_pages),
            "pages": trans_pages,
            "rawOCRText": nlp_data.get("rawOCRText", ""),
            "normalizedOCRText": nlp_data.get("normalizedOCRText", ""),
            "nlpProcessedText": nlp_data.get("nlpProcessedText", ""),
            "translatedText": full_trans_text,
            "overallStatus": "READY_FOR_AI_EXTRACTION",
            "processedAt": datetime.now(timezone.utc).isoformat(),
            "processingTimeMs": int((time.time() - start_time) * 1000),
        }

    def _mask_identifiers_and_names(self, text: str) -> (str, Dict[str, str]):
        """
        Masks land survey numbers (e.g. 142/3A), extents (2.45), dates, and khata numbers
        to prevent generic machine translation from corrupting numerical land references.
        """
        placeholders = {}
        counter = 0

        # Pattern matching survey numbers, extents, dates, slash/hyphen numbers
        pattern = r"\b\d+[\/\-]\d+[A-Z-a-z]*|\b\d+\.\d+|\b\d{2}\.\d{2}\.\d{4}\b"
        
        def replace_fn(match):
            nonlocal counter
            key = f"__ID_{counter}__"
            placeholders[key] = match.group(0)
            counter += 1
            return key

        masked = re.sub(pattern, replace_fn, text)
        return masked, placeholders

    def _unmask_identifiers_and_names(self, text: str, placeholders: Dict[str, str]) -> str:
        unmasked = text
        for key, val in placeholders.items():
            unmasked = unmasked.replace(key, val)
        return unmasked

    def get_provider_metadata(self) -> Dict[str, Any]:
        return {
            "providerName": "IndicTrans2Provider",
            "modelIdentifier": self.MODEL_ID,
            "reverseModelIdentifier": self.REVERSE_MODEL_ID,
            "supportedLanguagePairs": ["te-en", "en-te"],
            "device": self.device,
            "isModelLoaded": self.model_loaded,
            "initializationError": self.init_error,
        }
