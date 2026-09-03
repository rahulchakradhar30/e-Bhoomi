from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any
from app.nlp.indic_nlp_service import IndicNLPService
from app.schemas.schemas import DocumentNLPResponse

router = APIRouter(prefix="/document-processing", tags=["nlp"])
nlp_service = IndicNLPService()

@router.post("/nlp", response_model=DocumentNLPResponse)
async def process_nlp(
    ocrData: Dict[str, Any] = Body(...)
):
    try:
        if not ocrData:
            raise HTTPException(status_code=400, detail="OCR data is required for NLP preprocessing.")

        nlp_result = nlp_service.process_ocr_document(ocrData)
        return nlp_result
    except Exception as err:
        raise HTTPException(status_code=500, detail=f"Indic NLP Processing Failed: {str(err)}")

@router.get("/nlp/metadata")
async def get_nlp_metadata():
    return {
        "provider": "IndicNLPService",
        "indicNlplibAvailable": nlp_service.indic_nlp_available,
        "supportedLanguages": ["te", "en"],
        "version": "v0.2.0"
    }
