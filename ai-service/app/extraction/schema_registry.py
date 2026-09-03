from typing import Dict, List, Any, Optional

class DocumentSchemaRegistry:
    """
    Registry for e-Bhoomi Document-Type-Aware Schemas.
    Configures specific land record fields, extraction rules, and party structures.
    """

    SCHEMA_VERSION = "2.0.0"

    SUPPORTED_DOCUMENT_TYPES = {
        "ADANGAL": {
            "name": "Adangal / Pahani",
            "category": "ADANGAL",
            "fields": [
                "ownerName", "fatherOrHusbandName", "relationship", "khataNumber",
                "surveyNumber", "subDivisionNumber", "extent", "landClassification",
                "cultivatorName", "cropType", "village", "mandal", "district"
            ],
            "supportsParties": True,
            "supportsBoundaries": True,
        },
        "ROR_1B": {
            "name": "Record of Rights (1B)",
            "category": "ROR_1B",
            "fields": [
                "ownerName", "fatherOrHusbandName", "relationship", "khataNumber",
                "surveyNumber", "subDivisionNumber", "extent", "landClassification",
                "rightsNature", "village", "mandal", "district"
            ],
            "supportsParties": True,
            "supportsBoundaries": False,
        },
        "MUTATION": {
            "name": "Mutation Document / Title Transfer",
            "category": "MUTATION",
            "fields": [
                "ownerName", "fatherOrHusbandName", "previousOwnerName", "mutationReference",
                "mutationDate", "surveyNumber", "subDivisionNumber", "extent",
                "transactionType", "village", "mandal", "district"
            ],
            "supportsParties": True,
            "supportsBoundaries": True,
        },
        "PARTITION_SUCCESSION": {
            "name": "Partition / Succession Record",
            "category": "PARTITION_SUCCESSION",
            "fields": [
                "ancestorName", "deceasedOwnerName", "partitionDate", "surveyNumber",
                "subDivisionNumber", "totalExtent", "allocatedExtent", "village", "mandal", "district"
            ],
            "supportsParties": True,
            "supportsBoundaries": True,
        },
        "PATTADAR_PASSBOOK_TITLE_DEED": {
            "name": "Pattadar Passbook / Title Deed",
            "category": "PATTADAR_PASSBOOK_TITLE_DEED",
            "fields": [
                "ownerName", "fatherOrHusbandName", "passbookNumber", "khataNumber",
                "surveyNumber", "subDivisionNumber", "extent", "landClassification",
                "issueDate", "village", "mandal", "district"
            ],
            "supportsParties": True,
            "supportsBoundaries": False,
        },
        "LEGACY_REVENUE_RECORD": {
            "name": "Legacy Revenue Record",
            "category": "LEGACY_REVENUE_RECORD",
            "fields": [
                "ownerName", "fatherOrHusbandName", "surveyNumber", "subDivisionNumber",
                "extent", "recordYear", "village", "mandal", "district"
            ],
            "supportsParties": True,
            "supportsBoundaries": True,
        },
        "UNKNOWN_OTHER": {
            "name": "Unspecified Land Record Document",
            "category": "UNKNOWN_OTHER",
            "fields": [
                "ownerName", "surveyNumber", "subDivisionNumber", "extent",
                "village", "mandal", "district"
            ],
            "supportsParties": True,
            "supportsBoundaries": True,
        },
    }

    @classmethod
    def get_schema(cls, doc_type: str) -> Dict[str, Any]:
        normalized_type = doc_type.upper().strip() if doc_type else "UNKNOWN_OTHER"
        return cls.SUPPORTED_DOCUMENT_TYPES.get(
            normalized_type, cls.SUPPORTED_DOCUMENT_TYPES["UNKNOWN_OTHER"]
        )
