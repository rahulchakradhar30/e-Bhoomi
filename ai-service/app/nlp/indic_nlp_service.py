import re
import time
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional

from app.nlp.glossary import LandRecordGlossary

class IndicNLPService:
    """
    Indic NLP Preprocessing Service for e-Bhoomi.
    Handles Indic Unicode normalization, tokenization, sentence segmentation,
    mixed-language detection, and glossary matching without altering numbers or owner names.
    """

    def __init__(self):
        self.glossary = LandRecordGlossary()
        self.indic_nlp_available = False
        self._init_indic_nlp()

    def _init_indic_nlp(self):
        try:
            import indic_nlp
            self.indic_nlp_available = True
            print("[IndicNLPService] Indic NLP Library initialized successfully.")
        except Exception as err:
            self.indic_nlp_available = False
            print(f"[IndicNLPService] Indic NLP Library fallback mode active. Info: {err}")

    def process_text(self, text: str, language_hint: str = "te") -> Dict[str, Any]:
        """
        Processes a string of normalized Telugu OCR text.
        Preserves survey numbers (123/4), extents (2.50), and personal names exactly.
        """
        start_time = time.time()
        if not text:
            return {
                "nlpProcessedText": "",
                "tokens": [],
                "sentences": [],
                "glossaryHits": [],
                "detectedLanguages": [language_hint],
                "processingTimeMs": 0,
            }

        # 1. Indic Unicode Normalization
        normalized_text = self._normalize_unicode(text, language_hint)

        # 2. Tokenization preserving numbers, punctuation, slashes, hyphens
        tokens = self._tokenize_text(normalized_text, language_hint)

        # 3. Sentence Segmentation preserving page/line structures
        sentences = self._segment_sentences(normalized_text)

        # 4. Extract Land Record Glossary hits
        glossary_hits = self.glossary.extract_glossary_hits(normalized_text)

        # 5. Mixed-Language Detection (Telugu + English)
        detected_langs = self._detect_languages(normalized_text)

        return {
            "nlpProcessedText": normalized_text,
            "tokens": tokens,
            "sentences": sentences,
            "glossaryHits": glossary_hits,
            "detectedLanguages": detected_langs,
            "processingTimeMs": int((time.time() - start_time) * 1000),
        }

    def process_ocr_document(self, ocr_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processes a full page-wise OCR document package from Phase 1B/1C.
        Preserves page references, region metadata, raw OCR text, and normalized OCR text.
        """
        start_time = time.time()
        pages_input = ocr_data.get("pages", [])
        nlp_pages = []
        full_nlp_text_parts = []
        overall_langs = set()

        for page in pages_input:
            p_num = page.get("pageNumber", 1)
            raw_ocr = page.get("rawText", "")
            norm_ocr = page.get("normalizedText", "")
            regions_input = page.get("regions", [])

            # Process page text through NLP service
            page_nlp_res = self.process_text(norm_ocr or raw_ocr, "te")
            overall_langs.update(page_nlp_res["detectedLanguages"])
            full_nlp_text_parts.append(page_nlp_res["nlpProcessedText"])

            nlp_regions = []
            for reg in regions_input:
                reg_norm = reg.get("normalizedText", "") or reg.get("rawText", "")
                reg_nlp_res = self.process_text(reg_norm, "te")
                nlp_regions.append({
                    "regionIndex": reg.get("regionIndex", 0),
                    "regionType": reg.get("regionType", "PRINTED_TEXT"),
                    "boundingBox": reg.get("boundingBox", None),
                    "provider": reg.get("provider", ""),
                    "rawText": reg.get("rawText", ""),
                    "normalizedText": reg.get("normalizedText", ""),
                    "nlpProcessedText": reg_nlp_res["nlpProcessedText"],
                    "status": "COMPLETED",
                })

            nlp_pages.append({
                "pageNumber": p_num,
                "status": "COMPLETED",
                "rawOCRText": raw_ocr,
                "normalizedOCRText": norm_ocr,
                "nlpProcessedText": page_nlp_res["nlpProcessedText"],
                "sentences": page_nlp_res["sentences"],
                "tokensCount": len(page_nlp_res["tokens"]),
                "glossaryHits": page_nlp_res["glossaryHits"],
                "regions": nlp_regions,
            })

        full_nlp_text = "\n\n".join(full_nlp_text_parts)

        return {
            "nlpJobId": f"NLP-{int(time.time())}",
            "status": "NLP_COMPLETED",
            "provider": "IndicNLPService",
            "libraryVersion": "indic-nlp-library v0.2.0",
            "detectedLanguages": list(overall_langs) or ["te"],
            "pageCount": len(nlp_pages),
            "pages": nlp_pages,
            "rawOCRText": ocr_data.get("rawOCRText", ""),
            "normalizedOCRText": ocr_data.get("normalizedOCRText", ""),
            "nlpProcessedText": full_nlp_text,
            "overallStatus": "READY_FOR_TRANSLATION",
            "processedAt": datetime.now(timezone.utc).isoformat(),
            "processingTimeMs": int((time.time() - start_time) * 1000),
        }

    def _normalize_unicode(self, text: str, lang: str) -> str:
        if self.indic_nlp_available:
            try:
                from indicnlp.normalize.indic_normalize import IndicNormalizerFactory
                factory = IndicNormalizerFactory()
                normalizer = factory.get_normalizer(lang)
                return normalizer.normalize(text)
            except Exception:
                pass

        # Safe fallback normalization
        text = text.replace("\r\n", "\n").replace("\r", "\n")
        lines = [re.sub(r"[ \t]+", " ", line).strip() for line in text.split("\n")]
        return "\n".join(line for line in lines if line)

    def _tokenize_text(self, text: str, lang: str) -> List[Dict[str, Any]]:
        if self.indic_nlp_available:
            try:
                from indicnlp.tokenize import indic_tokenize
                raw_tokens = indic_tokenize.trivial_tokenize(text, lang)
                return [{"tokenIndex": idx, "token": tok} for idx, tok in enumerate(raw_tokens)]
            except Exception:
                pass

        # Regex fallback preserving alphanumeric, Telugu unicode, slashes, hyphens, dots
        pattern = r"[\u0C00-\u0C7F]+|[a-zA-Z0-9\./\-]+"
        matches = re.finditer(pattern, text)
        tokens = []
        for idx, match in enumerate(matches):
            tokens.append({
                "tokenIndex": idx,
                "token": match.group(0),
                "start": match.start(),
                "end": match.end(),
            })
        return tokens

    def _segment_sentences(self, text: str) -> List[str]:
        if not text:
            return []

        # Split on linebreaks or sentence terminators (., ।, ?)
        raw_sentences = re.split(r"[\.\।\?\n]+", text)
        return [s.strip() for s in raw_sentences if s.strip()]

    def _detect_languages(self, text: str) -> List[str]:
        langs = set()
        if re.search(r"[\u0C00-\u0C7F]", text):
            langs.add("te")
        if re.search(r"[a-zA-Z]", text):
            langs.add("en")
        return list(langs) if langs else ["te"]
