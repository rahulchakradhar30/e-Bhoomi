from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from typing import Optional
from app.preprocessing.document_preprocessor import DocumentPreprocessor
from app.ocr.telugu_ocr_provider import TeluguOCRProvider
from app.ocr.telugu_handwritten_provider import TeluguHandwrittenOCRProvider
from app.ocr.region_router import OCRRegionRouter
from app.schemas.schemas import DocumentOCRResponse

router = APIRouter(prefix="/document-processing", tags=["ocr"])
preprocessor = DocumentPreprocessor()
printed_ocr_provider = TeluguOCRProvider()
handwritten_ocr_provider = TeluguHandwrittenOCRProvider()
region_router = OCRRegionRouter()

@router.post("/ocr", response_model=DocumentOCRResponse)
async def process_ocr(
    file: UploadFile = File(...),
    documentType: Optional[str] = Form(None)
):
    try:
        import io
        import pypdf

        contents = await file.read()
        if not contents:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        # 1. Run Phase 1A OpenCV page rendering & preprocessing
        pages_bgr = preprocessor._extract_pages_as_images(
            contents, file.content_type or "application/pdf"
        )

        # 2. Run Phase 1C Intelligent Region Router (Printed + Handwritten OCR)
        ocr_result = region_router.process_document_with_region_routing(pages_bgr)

        # 3. If document is a digital PDF (e.g. government PDF), extract native text layers
        is_pdf = (file.content_type and "pdf" in file.content_type.lower()) or contents.startswith(b"%PDF")
        if is_pdf and (not ocr_result.rawOCRText or not ocr_result.rawOCRText.strip()):
            try:
                reader = pypdf.PdfReader(io.BytesIO(contents))
                pdf_texts = []
                for p_idx, page in enumerate(reader.pages, start=1):
                    p_text = page.extract_text()
                    if p_text and p_text.strip():
                        pdf_texts.append(p_text.strip())
                if pdf_texts:
                    joined_text = "\n\n".join(pdf_texts)
                    ocr_result.rawOCRText = joined_text
                    ocr_result.normalizedOCRText = joined_text
                    ocr_result.status = "COMPLETED"
                    ocr_result.provider = "PyPDF Native Text Extractor + OCR Router"
                    ocr_result.language = "en" if any(c.isascii() and c.isalpha() for c in joined_text) else "te"
            except Exception as pdf_err:
                print(f"[OCR Router] PyPDF text extraction notice: {pdf_err}")

        return ocr_result
    except Exception as err:
        raise HTTPException(status_code=500, detail=f"Telugu OCR Processing Failed: {str(err)}")

@router.post("/handwritten-ocr", response_model=DocumentOCRResponse)
async def process_handwritten_ocr(
    file: UploadFile = File(...),
    documentType: Optional[str] = Form(None)
):
    try:
        contents = await file.read()
        if not contents:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        pages_bgr = preprocessor._extract_pages_as_images(
            contents, file.content_type or "application/pdf"
        )

        ocr_result = handwritten_ocr_provider.process_document_images(pages_bgr)
        return ocr_result
    except Exception as err:
        raise HTTPException(status_code=500, detail=f"Telugu Handwritten OCR Failed: {str(err)}")

from app.ocr.language_detector import PythonLanguageDetector
from app.ocr.english_ocr import PythonEnglishOCR

lang_detector = PythonLanguageDetector()
english_ocr = PythonEnglishOCR()

@router.post("/ocr/detect-language")
async def detect_language(payload: dict):
    text = payload.get("text", "")
    return lang_detector.detect_language(text)

@router.post("/ocr/english")
async def process_english_ocr(payload: dict):
    text = payload.get("text", "")
    return english_ocr.process_text(text)

@router.get("/ocr/metadata")
async def get_ocr_metadata():
    return {
        "printedProvider": printed_ocr_provider.get_provider_metadata(),
        "handwrittenProvider": handwritten_ocr_provider.get_provider_metadata(),
        "englishProvider": english_ocr.ENGINE_VERSION,
    }
