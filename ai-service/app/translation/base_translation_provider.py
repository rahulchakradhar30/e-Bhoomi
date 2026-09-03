from abc import ABC, abstractmethod
from typing import Dict, List, Any

class BaseTranslationProvider(ABC):
    """
    Abstract Base Class for e-Bhoomi Server-Side Translation Providers.
    Defines a pluggable abstraction so IndicTrans2 or future translation models
    can be swapped without altering downstream AI extraction pipelines.
    """

    @abstractmethod
    def translate_text(self, text: str, source_lang: str = "te", target_lang: str = "en") -> Dict[str, Any]:
        """
        Translates a single string of text.
        """
        pass

    @abstractmethod
    def translate_document(self, nlp_data: Dict[str, Any], source_lang: str = "te", target_lang: str = "en") -> Dict[str, Any]:
        """
        Translates a page-wise NLP document package.
        """
        pass

    @abstractmethod
    def get_provider_metadata(self) -> Dict[str, Any]:
        """
        Returns provider metadata (model name, language pairs, device, load status).
        """
        pass
