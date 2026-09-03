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

class GlossaryHit(BaseModel):
    term: str
    category: str
    normalizedForm: str
    englishReference: Optional[str] = None

class PageNLPResult(BaseModel):
    pageNumber: int
    status: str = "COMPLETED"
    rawOCRText: str = ""
    normalizedOCRText: str = ""
    nlpProcessedText: str = ""
    sentences: List[str] = Field(default_factory=list)
    tokensCount: int = 0
    glossaryHits: List[GlossaryHit] = Field(default_factory=list)
    regions: List[dict] = Field(default_factory=list)

class DocumentNLPResponse(BaseModel):
    nlpJobId: str
    status: str = "NLP_COMPLETED"
    provider: str = "IndicNLPService"
    libraryVersion: str = "indic-nlp-library v0.2.0"
    detectedLanguages: List[str] = Field(default_factory=lambda: ["te"])
    pageCount: int
    pages: List[PageNLPResult]
    rawOCRText: str = ""
    normalizedOCRText: str = ""
    nlpProcessedText: str = ""
    overallStatus: str = "READY_FOR_TRANSLATION"
    processedAt: str
    processingTimeMs: Optional[int] = 0

class TranslationSegmentResult(BaseModel):
    source: str
    target: str

class PageTranslationResult(BaseModel):
    pageNumber: int
    status: str = "COMPLETED"
    rawOCRText: str = ""
    normalizedOCRText: str = ""
    nlpProcessedText: str = ""
    translatedText: str = ""
    segments: List[TranslationSegmentResult] = Field(default_factory=list)
    regions: List[dict] = Field(default_factory=list)

class DocumentTranslationResponse(BaseModel):
    translationId: str
    status: str = "COMPLETED"
    provider: str = "IndicTrans2Provider"
    model: str = "ai4bharat/indictrans2-indic-en-1B"
    sourceLanguage: str = "te"
    targetLanguage: str = "en"
    device: str = "cpu"
    pageCount: int
    pages: List[PageTranslationResult]
    rawOCRText: str = ""
    normalizedOCRText: str = ""
    nlpProcessedText: str = ""
    translatedText: str = ""
    overallStatus: str = "READY_FOR_AI_EXTRACTION"
    processedAt: str
    processingTimeMs: Optional[int] = 0

class BoundaryResult(BaseModel):
    east: Optional[str] = None
    west: Optional[str] = None
    north: Optional[str] = None
    south: Optional[str] = None

class PartyResult(BaseModel):
    partyId: str
    name: str
    role: str = "PRIMARY_PATTADAR"
    relationship: Optional[str] = None
    share: Optional[str] = None
    extent: Optional[str] = None

class CommonLandRecordFields(BaseModel):
    ownerName: Optional[str] = None
    fatherOrHusbandName: Optional[str] = None
    relationship: Optional[str] = None
    surveyNumber: Optional[str] = None
    subDivisionNumber: Optional[str] = None
    khasraNumber: Optional[str] = None
    khataNumber: Optional[str] = None
    extent: Optional[str] = None
    landClassification: Optional[str] = None
    district: Optional[str] = None
    revenueDivision: Optional[str] = None
    mandal: Optional[str] = None
    village: Optional[str] = None
    documentDate: Optional[str] = None
    registrationDate: Optional[str] = None
    mutationReference: Optional[str] = None
    registrationNumber: Optional[str] = None

class DocumentExtractionResponse(BaseModel):
    extractionId: str
    status: str = "AI_EXTRACTION_COMPLETED"
    provider: str = "AIExtractionProvider"
    modelVersion: str = "eBhoomi-LandRecord-NER-v2.0"
    promptVersion: str = "v2.1-StructuredJSON"
    schemaVersion: str = "2.0.0"
    documentType: str = "UNKNOWN_OTHER"
    documentTypeName: str = "Unspecified Land Record Document"
    aiExtractedRecord: CommonLandRecordFields
    boundaries: BoundaryResult
    parties: List[PartyResult] = Field(default_factory=list)
    unmappedFields: List[dict] = Field(default_factory=list)
    sourceReferences: List[dict] = Field(default_factory=list)
    rawOCRText: str = ""
    normalizedOCRText: str = ""
    nlpProcessedText: str = ""
    translatedText: str = ""
    overallStatus: str = "READY_FOR_CONFIDENCE_AND_VALIDATION"
    extractedAt: str
    processingTimeMs: Optional[int] = 0

class EvidenceItem(BaseModel):
    pageNumber: int = 1
    regionId: Optional[str] = None
    boundingBox: Optional[dict] = None
    sourceText: str = ""
    translatedText: Optional[str] = None
    evidenceType: str = "NLP_TEXT"

class FieldConfidenceResult(BaseModel):
    fieldName: str
    value: Optional[str] = None
    score: Optional[float] = None
    scoreSource: str = "UNAVAILABLE"
    status: str = "HIGH_CONFIDENCE"
    reviewPriority: str = "LOW"
    evidence: List[EvidenceItem] = Field(default_factory=list)
    candidates: List[dict] = Field(default_factory=list)
    explanation: Optional[str] = None

class DocumentConfidenceSummary(BaseModel):
    overallConfidenceScore: float = 0.0
    overallReviewPriority: str = "LOW"
    totalFieldsEvaluated: int = 0
    highConfidenceFieldsCount: int = 0
    lowConfidenceFieldsCount: int = 0
    conflictFieldsCount: int = 0
    missingEvidenceFieldsCount: int = 0
    criticalFieldsRequiringReview: List[str] = Field(default_factory=list)
    reviewRecommendation: str = ""

class DocumentConfidenceResponse(BaseModel):
    confidenceJobId: str
    status: str = "CONFIDENCE_COMPLETED"
    engineVersion: str = "v3.0-MultiSignalTraceability"
    thresholdConfig: dict = Field(default_factory=lambda: {"highThreshold": 0.85, "mediumThreshold": 0.65})
    documentSummary: DocumentConfidenceSummary
    fieldsConfidence: dict = Field(default_factory=dict)
    boundariesConfidence: dict = Field(default_factory=dict)
    extractionId: str = ""
    overallStatus: str = "READY_FOR_VALIDATION"
    evaluatedAt: str
    processingTimeMs: Optional[int] = 0





