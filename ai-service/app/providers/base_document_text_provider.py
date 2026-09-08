from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

class BaseDocumentTextProvider(ABC):
    """
    Abstract Base Class for Document Text Extraction Providers.
    Accepts real processed page images / document representations from OpenCV preprocessing stage
    and extracts text in a normalized format without fabricating confidence values.
    """

    @property
    @abstractmethod
    def provider_id(self) -> str:
        pass

    @property
    @abstractmethod
    def provider_name(self) -> str:
        pass

    @abstractmethod
    def health_check(self) -> Dict[str, Any]:
        """
        Verifies whether the provider is configured and available.
        """
        pass

    @abstractmethod
    def extract_document_text(self, pages: List[Dict[str, Any]], metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Extracts text from the provided preprocessed pages.
        
        Args:
            pages: List of dictionaries containing pageNumber, base64Preview/image bytes, etc.
            metadata: Optional dictionary with documentName, documentType, etc.
            
        Returns:
            Normalized dictionary:
            {
                "success": bool,
                "pages": [
                    {
                        "pageNumber": int,
                        "text": str,
                        "language": str,
                        "source": str
                    }
                ],
                "fullText": str,
                "provider": str,
                "model": str,
                "processingMetadata": dict,
                "error": Optional[str]
            }
        """
        pass
