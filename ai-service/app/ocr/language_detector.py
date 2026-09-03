import re

class PythonLanguageDetector:
    """
    Python Language Detection Service for e-Bhoomi (Phase 7).
    """

    def detect_language(self, text: str) -> dict:
        if not text or not text.strip():
            return {
                "detectedLanguage": "UNKNOWN",
                "languageConfidence": 0.0,
                "detectionSource": "UNAVAILABLE",
                "teluguCharRatio": 0.0,
                "englishCharRatio": 0.0,
                "reason": "Text is empty.",
            }

        telugu_count = len(re.findall(r'[\u0C00-\u0C7F]', text))
        english_count = len(re.findall(r'[A-Za-z]', text))
        total_alpha = telugu_count + english_count

        if total_alpha == 0:
            return {
                "detectedLanguage": "UNKNOWN",
                "languageConfidence": 0.5,
                "detectionSource": "TEXT_HEURISTIC",
                "teluguCharRatio": 0.0,
                "englishCharRatio": 0.0,
                "reason": "Text contains symbols/numbers without alphabetic characters.",
            }

        te_ratio = telugu_count / total_alpha
        en_ratio = english_count / total_alpha

        if te_ratio > 0.7:
            lang = "TELUGU"
        elif en_ratio > 0.7:
            lang = "ENGLISH"
        elif te_ratio > 0.2 and en_ratio > 0.2:
            lang = "MIXED_TE"
        elif te_ratio > 0:
            lang = "TELUGU"
        else:
            lang = "ENGLISH"

        return {
            "detectedLanguage": lang,
            "languageConfidence": 0.92,
            "detectionSource": "TEXT_HEURISTIC",
            "teluguCharRatio": round(te_ratio, 2),
            "englishCharRatio": round(en_ratio, 2),
            "reason": f"Language detected as {lang}.",
        }
