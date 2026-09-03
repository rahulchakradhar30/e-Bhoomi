from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any
from app.translation.indic_trans2_provider import IndicTrans2Provider
from app.schemas.schemas import DocumentTranslationResponse

router = APIRouter(prefix="/document-processing", tags=["translation"])
translation_provider = IndicTrans2Provider()

@router.post("/translation", response_model=DocumentTranslationResponse)
async def process_translation(
    nlpData: Dict[str, Any] = Body(...)
):
    try:
        if not nlpData:
            raise HTTPException(status_code=400, detail="NLP data is required for translation.")

        translation_result = translation_provider.translate_document(nlpData, "te", "en")
        return translation_result
    except Exception as err:
        raise HTTPException(status_code=500, detail=f"IndicTrans2 Processing Failed: {str(err)}")

@router.get("/translation/metadata")
async def get_translation_metadata():
    return translation_provider.get_provider_metadata()
