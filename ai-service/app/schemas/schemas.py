from typing import List, Optional
from pydantic import BaseModel, Field

class DiagnosticsData(BaseModel):
    blurDetected: bool = False
    blurScore: float = 0.0
    skewDetected: bool = False
    skewAngle: float = 0.0
    rotationDetected: bool = False
    rotationAngle: int = 0
    lowContrastDetected: bool = False
    contrastScore: float = 0.0
    noiseDetected: bool = False
    pageTypeCandidate: str = "DOCUMENT" # "DOCUMENT" | "MAP_OR_DIAGRAM"

class ProcessedPageResult(BaseModel):
    pageNumber: int
    originalReference: str
    processedReference: str
    preprocessingStatus: str = "COMPLETED"
    transformationsApplied: List[str] = Field(default_factory=list)
    diagnostics: DiagnosticsData
    base64Preview: Optional[str] = None

class DocumentPreprocessResponse(BaseModel):
    processingId: str
    status: str
    pageCount: int
    pages: List[ProcessedPageResult]
    processedAt: str
    serviceVersion: str = "eBhoomi OpenCV Preprocessing Service v1.0"

class LineOCRResult(BaseModel):
    lineIndex: int
    lineText: str
    boundingBox: Optional[dict] = None

class RegionOCRResult(BaseModel):
    regionIndex: int
    regionType: str = "PRINTED_TEXT"
    boundingBox: Optional[dict] = None
    provider: str = "TeluguOCRProvider"
    rawText: str = ""
    normalizedText: str = ""
    status: str = "COMPLETED"

class PageOCRResult(BaseModel):
    pageNumber: int
    status: str = "COMPLETED"
    rawText: str = ""
    normalizedText: str = ""
    lines: List[LineOCRResult] = Field(default_factory=list)
    regions: List[RegionOCRResult] = Field(default_factory=list)
    handwritingDetected: bool = False
    processingTimeMs: Optional[int] = 0
    errorMessage: Optional[str] = None

class DocumentOCRResponse(BaseModel):
    ocrId: str
    status: str
    provider: str = "TeluguOCR + TeluguHandwrittenOCR"
    model: Optional[str] = "harsha-desaraju/telugu-ocr-model + CharanS247/got-ocr2-telugu-handwritten"
    language: str = "te"
    device: str = "cpu"
    pageCount: int
    pages: List[PageOCRResult]
    rawOCRText: str = ""
    normalizedOCRText: str = ""
    handwritingDetected: bool = False
    overallStatus: str = "READY_FOR_LANGUAGE_PROCESSING"
    processedAt: str
    processingTimeMs: Optional[int] = 0

