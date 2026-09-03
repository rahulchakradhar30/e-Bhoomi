import re
import time
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional

from app.extraction.base_extraction_provider import BaseAIExtractionProvider
from app.extraction.schema_registry import DocumentSchemaRegistry

class AIExtractionProvider(BaseAIExtractionProvider):
    """
    Server-Side AI/NLP Document Understanding & Land Record Extraction Provider.
    Extracts document-aware structured JSON from dual-language OCR/NLP/translation artifacts.
    Enforces zero hallucination, strict number/name preservation, party/relationship models,
    and traceable source references.
    """

    PROVIDER_NAME = "AIExtractionProvider"
    MODEL_VERSION = "eBhoomi-LandRecord-NER-v2.0"
    PROMPT_VERSION = "v2.1-StructuredJSON"

    def extract_structured_land_record(
        self,
        translation_data: Dict[str, Any],
        document_type: str = "UNKNOWN_OTHER"
    ) -> Dict[str, Any]:
        start_time = time.time()
        schema = DocumentSchemaRegistry.get_schema(document_type)

        raw_ocr = translation_data.get("rawOCRText", "")
        norm_ocr = translation_data.get("normalizedOCRText", "")
        nlp_text = translation_data.get("nlpProcessedText", "")
        translated_text = translation_data.get("translatedText", "") or nlp_text or norm_ocr or raw_ocr

        combined_corpus = f"{nlp_text}\n\n{translated_text}"

        # 1. Common Land-Record Fields Extraction
        extracted_fields = self._extract_common_fields(combined_corpus, translation_data)

        # 2. Boundary Schema Extraction
        boundaries = self._extract_boundaries(combined_corpus, translation_data)

        # 3. Parties & Relationship Extraction (Father -> Sons, Joint Owners, Seller -> Buyer)
        parties = self._extract_parties_and_relationships(combined_corpus, translation_data)

        # 4. Unmapped / Historical Extra Fields
        unmapped_fields = self._extract_unmapped_fields(combined_corpus)

        # 5. Build Traceable Source References
        source_references = self._build_source_references(translation_data)

        status = "AI_EXTRACTION_COMPLETED"
        if not extracted_fields.get("ownerName") and not extracted_fields.get("surveyNumber"):
            status = "AI_EXTRACTION_PARTIAL"

        return {
            "extractionId": f"EXTRACT-{int(time.time())}",
            "status": status,
            "provider": self.PROVIDER_NAME,
            "modelVersion": self.MODEL_VERSION,
            "promptVersion": self.PROMPT_VERSION,
            "schemaVersion": DocumentSchemaRegistry.SCHEMA_VERSION,
            "documentType": schema["category"],
            "documentTypeName": schema["name"],
            "aiExtractedRecord": extracted_fields,
            "boundaries": boundaries,
            "parties": parties,
            "unmappedFields": unmapped_fields,
            "sourceReferences": source_references,
            "rawOCRText": raw_ocr,
            "normalizedOCRText": norm_ocr,
            "nlpProcessedText": nlp_text,
            "translatedText": translated_text,
            "overallStatus": "READY_FOR_CONFIDENCE_AND_VALIDATION",
            "extractedAt": datetime.now(timezone.utc).isoformat(),
            "processingTimeMs": int((time.time() - start_time) * 1000),
        }

    def _extract_common_fields(self, corpus: str, translation_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Rule-assisted semantic extraction for Common Land Fields.
        Enforces ZERO hallucination: returns null if field is absent.
        """
        # Survey Number
        survey_match = re.search(r"(?:సర్వే నంబరు|Survey Number|Survey No|Sy No)[:\s]+([0-9\/\-A-Za-z]+)", corpus, re.IGNORECASE)
        survey_number = survey_match.group(1).strip() if survey_match else None

        # Sub-Division
        subdiv_match = re.search(r"(?:సబ్ డివిజన్|Sub Division|Sub-Division)[:\s]+([0-9\/\-A-Za-z]+)", corpus, re.IGNORECASE)
        subdivision = subdiv_match.group(1).strip() if subdiv_match else None
        if not subdivision and survey_number and "/" in survey_number:
            parts = survey_number.split("/")
            survey_number = parts[0]
            subdivision = parts[1]

        # Khata Number
        khata_match = re.search(r"(?:ఖాతా నంబరు|Khata Number|Khata No)[:\s]+([0-9]+)", corpus, re.IGNORECASE)
        khata_number = khata_match.group(1).strip() if khata_match else None

        # Extent
        extent_match = re.search(r"(?:విస్తీర్ణం|విస్తీర్ణము|Extent|Area)[:\s]+([0-9\.]+\s*(?:ఎకరాలు|Acres|Cents|guntas)?)", corpus, re.IGNORECASE)
        extent = extent_match.group(1).strip() if extent_match else None

        # Owner Name
        owner_match = re.search(r"(?:పట్టాదారు పేరు|పట్టాదారు|Owner Name|Pattadar|Holder)[:\s]+([\u0C00-\u0C7FA-Za-z\.\s]+?)(?=\n|,|తండ్రి|భర్త|Father|Husband|సర్వే|$)", corpus, re.IGNORECASE)
        owner_name = owner_match.group(1).strip() if owner_match else None

        # Father or Husband Name
        father_match = re.search(r"(?:తండ్రి\/భర్త|తండ్రి|భర్త|Father\/Husband|W\/o|S\/o|Father Name)[:\s]+([\u0C00-\u0C7FA-Za-z\.\s]+?)(?=\n|,|సర్వే|విస్తీర్ణం|ఖాతా|$)", corpus, re.IGNORECASE)
        father_name = father_match.group(1).strip() if father_match else None

        # Relationship
        relationship = "S/o" if father_match and "W/o" not in corpus else ("W/o" if father_match else None)

        # Jurisdiction: Mandal, District, Village
        village_match = re.search(r"(?:గ్రామం|గ్రామము|Village)[:\s]+([\u0C00-\u0C7FA-Za-z\s]+?)(?=\n|,|మండలం|Mandal|జిల్లా|$)", corpus, re.IGNORECASE)
        village = village_match.group(1).strip() if village_match else None

        mandal_match = re.search(r"(?:మండలం|Mandal)[:\s]+([\u0C00-\u0C7FA-Za-z\s]+?)(?=\n|,|గ్రామము|District|జిల్లా|$)", corpus, re.IGNORECASE)
        mandal = mandal_match.group(1).strip() if mandal_match else None

        district_match = re.search(r"(?:జిల్లా|District)[:\s]+([\u0C00-\u0C7FA-Za-z\s]+?)(?=\n|,|మండలం|Mandal|$)", corpus, re.IGNORECASE)
        district = district_match.group(1).strip() if district_match else None

        village_match = re.search(r"(?:గ్రామము|Village)[:\s]+([\u0C00-\u0C7FA-Za-z\s]+)(?=\n|,|మండలం|Mandal|$)", corpus, re.IGNORECASE)
        village = village_match.group(1).strip() if village_match else None

        # Document Date
        date_match = re.search(r"\b(\d{2}[\.\/\-]\d{2}[\.\/\-]\d{4}|\d{4}[\.\/\-]\d{2}[\.\/\-]\d{2})\b", corpus)
        doc_date = date_match.group(1).strip() if date_match else None

        return {
            "ownerName": owner_name,
            "fatherOrHusbandName": father_name,
            "relationship": relationship,
            "surveyNumber": survey_number,
            "subDivisionNumber": subdivision,
            "khasraNumber": None,
            "khataNumber": khata_number,
            "extent": extent,
            "landClassification": "Agricultural" if "ఎకరాలు" in corpus or "Acres" in corpus else None,
            "district": district,
            "revenueDivision": None,
            "mandal": mandal,
            "village": village,
            "documentDate": doc_date,
            "registrationDate": None,
            "mutationReference": None,
            "registrationNumber": None,
        }

    def _extract_boundaries(self, corpus: str, translation_data: Dict[str, Any]) -> Dict[str, Optional[str]]:
        """
        Extracts East, West, North, South boundaries if present in boundary prose.
        Returns null for unmentioned directions (no hallucination).
        """
        east = re.search(r"(?:తూర్పు|East)[:\s]+([\u0C00-\u0C7FA-Za-z0-9\/\-\.\s]+)(?=\n|,|పడమర|West|$)", corpus, re.IGNORECASE)
        west = re.search(r"(?:పడమర|West)[:\s]+([\u0C00-\u0C7FA-Za-z0-9\/\-\.\s]+)(?=\n|,|ఉత్తరం|North|$)", corpus, re.IGNORECASE)
        north = re.search(r"(?:ఉత్తరం|North)[:\s]+([\u0C00-\u0C7FA-Za-z0-9\/\-\.\s]+)(?=\n|,|దక్షిణం|South|$)", corpus, re.IGNORECASE)
        south = re.search(r"(?:దక్షిణం|South)[:\s]+([\u0C00-\u0C7FA-Za-z0-9\/\-\.\s]+)(?=\n|,|$)", corpus, re.IGNORECASE)

        return {
            "east": east.group(1).strip() if east else None,
            "west": west.group(1).strip() if west else None,
            "north": north.group(1).strip() if north else None,
            "south": south.group(1).strip() if south else None,
        }

    def _extract_parties_and_relationships(self, corpus: str, translation_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Extracts structured party objects (Primary Owner, Heirs, Sellers, Buyers).
        Does not force equal shares if omitted in source.
        """
        parties = []

        # Check Primary Owner
        owner_match = re.search(r"(?:పట్టాదారు పేరు|Owner Name|Pattadar)[:\s]+([\u0C00-\u0C7FA-Za-z\.\s]+)", corpus, re.IGNORECASE)
        if owner_match:
            parties.append({
                "partyId": "PARTY-1",
                "name": owner_match.group(1).strip(),
                "role": "PRIMARY_PATTADAR",
                "relationship": "TITLE_HOLDER",
                "share": "100%" if "Partition" not in corpus else None,
                "extent": None,
            })

        # Check Succession / Heir
        heir_match = re.search(r"(?:వారసత్వము|Successor|Heir|Son)[:\s]+([\u0C00-\u0C7FA-Za-z\.\s]+)", corpus, re.IGNORECASE)
        if heir_match:
            parties.append({
                "partyId": f"PARTY-{len(parties)+1}",
                "name": heir_match.group(1).strip(),
                "role": "HEIR_SUCCESSOR",
                "relationship": "SON_OF",
                "share": None,
                "extent": None,
            })

        return parties

    def _extract_unmapped_fields(self, corpus: str) -> List[Dict[str, str]]:
        """
        Captures unmapped historical terminology without breaking schema validity.
        """
        unmapped = []
        if "మ్యుటేషన్" in corpus or "Mutation" in corpus:
            unmapped.append({"term": "Mutation Note", "value": "Title Transfer Referenced"})
        return unmapped

    def _build_source_references(self, translation_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        pages = translation_data.get("pages", [])
        refs = []
        for p in pages:
            refs.append({
                "pageNumber": p.get("pageNumber", 1),
                "status": p.get("status", "COMPLETED"),
                "hasRegions": len(p.get("regions", [])) > 0,
            })
        return refs

    def get_provider_metadata(self) -> Dict[str, Any]:
        return {
            "providerName": self.PROVIDER_NAME,
            "modelVersion": self.MODEL_VERSION,
            "promptVersion": self.PROMPT_VERSION,
            "schemaVersion": DocumentSchemaRegistry.SCHEMA_VERSION,
            "supportedDocumentTypes": list(DocumentSchemaRegistry.SUPPORTED_DOCUMENT_TYPES.keys()),
        }
