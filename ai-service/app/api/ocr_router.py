from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from typing import Optional
from app.preprocessing.document_preprocessor import DocumentPreprocessor
from app.ocr.telugu_ocr_provider import TeluguOCRProvider
from app.schemas.schemas import DocumentOCRResponse

router = APIRouter(prefix="/document-processing", tags=["ocr"])
preprocessor = DocumentPreprocessor()
ocr_provider = TeluguOCRProvider()

@router.post("/ocr", response_model=DocumentOCRResponse)
async def process_ocr(
    file: UploadFile = File(...),
    documentType: Optional[str] = Form(None)
):
    try:
        contents = await file.read()
        if not contents:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        # 1. Run Phase 1A OpenCV page rendering & preprocessing
        pages_bgr = preprocessor._extract_pages_as_images(
            contents, file.content_type or "application/pdf"
        )

        # 2. Run Phase 1B Telugu OCR Provider
        ocr_result = ocr_provider.process_document_images(pages_bgr)
        return ocr_result
    except Exception as err:
        raise HTTPException(status_code=500, detail=f"Telugu OCR Processing Failed: {str(err)}")

@router.get("/ocr/metadata")
async def get_ocr_metadata():
    return ocr_provider.get_provider_metadata()
