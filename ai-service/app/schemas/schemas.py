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
