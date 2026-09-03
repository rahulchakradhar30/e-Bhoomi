from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any, Optional
from app.extraction.ai_extraction_provider import AIExtractionProvider
from app.schemas.schemas import DocumentExtractionResponse

router = APIRouter(prefix="/document-processing", tags=["extraction"])
extraction_provider = AIExtractionProvider()

@router.post("/extraction", response_model=DocumentExtractionResponse)
async def process_extraction(
    payload: Dict[str, Any] = Body(...)
):
    try:
        if not payload:
            raise HTTPException(status_code=400, detail="Translation / NLP data payload is required for extraction.")

        translation_data = payload.get("translationResult") or payload.get("nlpResult") or payload
        doc_type = payload.get("documentType") or "UNKNOWN_OTHER"

        extraction_result = extraction_provider.extract_structured_land_record(
            translation_data=translation_data,
            document_type=doc_type
        )
        return extraction_result
    except Exception as err:
        raise HTTPException(status_code=500, detail=f"AI/NLP Structured Extraction Failed: {str(err)}")

from app.extraction.groq_provider import PythonGroqProvider

groq_provider = PythonGroqProvider()

@router.post("/extract-groq")
async def extract_groq(
    payload: Dict[str, Any] = Body(...)
):
    try:
        if not payload:
            raise HTTPException(status_code=400, detail="Payload required for Groq AI extraction.")
        return groq_provider.extract_structured_record(payload)
    except Exception as err:
        raise HTTPException(status_code=500, detail=f"Groq AI Extraction Failed: {str(err)}")

@router.get("/extraction/metadata")
async def get_extraction_metadata():
    meta = extraction_provider.get_provider_metadata()
    meta["groqProvider"] = groq_provider.PROVIDER_NAME
    meta["groqModel"] = groq_provider.get_model()
    return meta
