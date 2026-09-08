from fastapi import APIRouter, File, UploadFile, HTTPException, Form, Body
from typing import Optional, List, Dict, Any
from app.preprocessing.document_preprocessor import DocumentPreprocessor
from app.providers.llama_document_text_provider import LlamaDocumentTextProvider

router = APIRouter(prefix="/document-processing", tags=["llama-text-extraction"])
preprocessor = DocumentPreprocessor()
llama_provider = LlamaDocumentTextProvider()

@router.get("/llama/health")
async def get_llama_health():
    """
    Returns Llama API provider configuration and readiness status.
    """
    return llama_provider.health_check()

@router.post("/llama-extract")
async def extract_text_with_llama(
    payload: Optional[Dict[str, Any]] = Body(None)
):
    """
    Accepts preprocessed pages from OpenCV stage and performs document text extraction via Llama API.
    """
    try:
        if not payload:
            raise HTTPException(status_code=400, detail="Missing request payload.")

        pages = payload.get("pages", [])
        metadata = payload.get("metadata", {})

        # If full preprocessed object is passed
        if not pages and "preprocessedPages" in payload:
            pages = payload["preprocessedPages"]

        if not pages:
            raise HTTPException(status_code=400, detail="No preprocessed pages found in payload.")

        result = llama_provider.extract_document_text(pages=pages, metadata=metadata)
        if not result.get("success"):
            status_code = 400 if result.get("status") == "LLAMA_KEY_MISSING" else 502
            return HTTPException(status_code=status_code, detail=result.get("error"))

        return result
    except HTTPException:
        raise
    except Exception as err:
        raise HTTPException(status_code=500, detail=f"Llama Text Extraction Failed: {str(err)}")

@router.post("/process-document-full")
async def process_document_opencv_and_llama(
    file: UploadFile = File(...),
    documentType: Optional[str] = Form(None)
):
    """
    Direct pipeline: File Bytes -> OpenCV Preprocessing -> Llama Text Extraction.
    """
    try:
        contents = await file.read()
        if not contents:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        # Stage 2: OpenCV Preprocessing
        prep_res = preprocessor.process_file(
            file_bytes=contents,
            file_name=file.filename or "uploaded_doc.pdf",
            mime_type=file.content_type or "application/pdf"
        )

        pages = prep_res.get("pages", [])
        # Stage 3: Llama Document Text Extraction
        llama_res = llama_provider.extract_document_text(
            pages=pages,
            metadata={"documentType": documentType, "fileName": file.filename}
        )

        return {
            "processingId": prep_res.get("processingId"),
            "preprocessing": prep_res,
            "llamaExtraction": llama_res,
        }
    except HTTPException:
        raise
    except Exception as err:
        raise HTTPException(status_code=500, detail=f"Full Document Processing Failed: {str(err)}")
