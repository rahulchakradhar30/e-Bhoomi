from typing import Dict, Any, Optional, List

class LandRecordGlossary:
    """
    Configurable Terminology & Glossary Layer for Telugu Land Record Vocabulary.
    Provides non-destructive term resolution without hardcoding legal interpretations.
    """

    DEFAULT_TERMS = {
        "అడంగల్": {"category": "DOCUMENT_TYPE", "normalizedForm": "Adangal", "englishReference": "Adangal / Village Account No. 3"},
        "హక్కుల పత్రము": {"category": "DOCUMENT_TYPE", "normalizedForm": "RoR-1B", "englishReference": "Record of Rights (1B)"},
        "పట్టాదారు": {"category": "OWNERSHIP", "normalizedForm": "Pattadar", "englishReference": "Title Holder / Pattadar"},
        "ఖాతా": {"category": "IDENTIFIER", "normalizedForm": "Khata Number", "englishReference": "Account / Khata Number"},
        "సర్వే నంబరు": {"category": "IDENTIFIER", "normalizedForm": "Survey Number", "englishReference": "Survey Number"},
        "విస్తీర్ణము": {"category": "MEASUREMENT", "normalizedForm": "Extent", "englishReference": "Land Extent (Acres/Cents)"},
        "మండలం": {"category": "JURISDICTION", "normalizedForm": "Mandal", "englishReference": "Revenue Mandal"},
        "జిల్లా": {"category": "JURISDICTION", "normalizedForm": "District", "englishReference": "Revenue District"},
        "గ్రామము": {"category": "JURISDICTION", "normalizedForm": "Village", "englishReference": "Revenue Village"},
        "మ్యుటేషన్": {"category": "TRANSACTION", "normalizedForm": "Mutation", "englishReference": "Mutation of Title"},
        "విభజన": {"category": "TRANSACTION", "normalizedForm": "Partition", "englishReference": "Land Partition"},
        "వారసత్వము": {"category": "TRANSACTION", "normalizedForm": "Succession", "englishReference": "Hereditary Succession"},
        "సరిహద్దులు": {"category": "GEOMETRY", "normalizedForm": "Boundaries", "englishReference": "Four Corners / Boundaries"},
        "తూర్పు": {"category": "DIRECTION", "normalizedForm": "East Boundary", "englishReference": "East"},
        "పడమర": {"category": "DIRECTION", "normalizedForm": "West Boundary", "englishReference": "West"},
        "ఉత్తరం": {"category": "DIRECTION", "normalizedForm": "North Boundary", "englishReference": "North"},
        "దక్షిణం": {"category": "DIRECTION", "normalizedForm": "South Boundary", "englishReference": "South"},
    }

    def __init__(self, custom_terms: Optional[Dict[str, Dict[str, str]]] = None):
        self.terms = dict(self.DEFAULT_TERMS)
        if custom_terms:
            self.terms.update(custom_terms)

    def lookup(self, text_token: str) -> Optional[Dict[str, str]]:
        token_clean = text_token.strip()
        return self.terms.get(token_clean, None)

    def extract_glossary_hits(self, text: str) -> List[Dict[str, Any]]:
        hits = []
        for term, meta in self.terms.items():
            if term in text:
                hits.append({
                    "term": term,
                    "category": meta["category"],
                    "normalizedForm": meta["normalizedForm"],
                    "englishReference": meta.get("englishReference", ""),
                })
        return hits
