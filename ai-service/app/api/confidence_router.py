from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any
from app.confidence.confidence_engine import ConfidenceEngine
from app.schemas.schemas import DocumentConfidenceResponse

router = APIRouter(prefix="/document-processing", tags=["confidence"])
confidence_engine = ConfidenceEngine()

@router.post("/confidence", response_model=DocumentConfidenceResponse)
async def process_confidence(
    payload: Dict[str, Any] = Body(...)
):
    try:
        if not payload:
            raise HTTPException(status_code=400, detail="Extraction payload is required for confidence scoring.")

        extraction_data = payload.get("extractionResult") or payload
        confidence_result = confidence_engine.evaluate_extraction_confidence(extraction_data)
        return confidence_result
    except Exception as err:
        raise HTTPException(status_code=500, detail=f"Confidence Engine Processing Failed: {str(err)}")

@router.get("/confidence/metadata")
async def get_confidence_metadata():
    return {
        "engineVersion": "v3.0-MultiSignalTraceability",
        "highThreshold": confidence_engine.high_threshold,
        "mediumThreshold": confidence_engine.medium_threshold,
        "criticalFields": list(confidence_engine.CRITICAL_FIELDS),
    }
