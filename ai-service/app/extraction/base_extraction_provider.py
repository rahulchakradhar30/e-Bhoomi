from abc import ABC, abstractmethod
from typing import Dict, List, Any

class BaseAIExtractionProvider(ABC):
    """
    Abstract Base Class for e-Bhoomi Server-Side AI/NLP Extraction Providers.
    Defines a pluggable abstraction for semantic document understanding and land record extraction.
    """

    @abstractmethod
    def extract_structured_land_record(
        self,
        translation_data: Dict[str, Any],
        document_type: str = "UNKNOWN_OTHER"
    ) -> Dict[str, Any]:
        """
        Extracts document-type-aware land record JSON from dual-language input package.
        """
        pass

    @abstractmethod
    def get_provider_metadata(self) -> Dict[str, Any]:
        """
        Returns provider metadata (model name, schema version, prompt version, supported document types).
        """
        pass
