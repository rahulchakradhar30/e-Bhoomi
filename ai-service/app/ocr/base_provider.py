from abc import ABC, abstractmethod
from typing import Dict, List, Any
import numpy as np

class BaseOCRProvider(ABC):
    """
    Abstract Base Class for e-Bhoomi Server-Side OCR Engines.
    Provides pluggable provider interface so Telugu OCR, English OCR, or future multimodal models
    can be registered without changing downstream pipeline logic.
    """

    @abstractmethod
    def process_page_image(self, image_bgr: np.ndarray, page_number: int) -> Dict[str, Any]:
        """
        Process a single preprocessed page image and return raw/normalized OCR text results.
        """
        pass

    @abstractmethod
    def process_document_images(self, pages_bgr: List[np.ndarray]) -> Dict[str, Any]:
        """
        Process multi-page document images page-by-page.
        """
        pass

    @abstractmethod
    def get_provider_metadata(self) -> Dict[str, Any]:
        """
        Return metadata regarding provider name, model identifier, version, device, and status.
        """
        pass
