from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any
from app.validation.validation_engine import PythonValidationEngine

router = APIRouter(prefix="/document-processing", tags=["validation"])
validation_engine = PythonValidationEngine()

@router.post("/validation")
async def process_validation(
    payload: Dict[str, Any] = Body(...)
):
    try:
        if not payload:
            raise HTTPException(status_code=400, detail="Payload is required for master data & business rule validation.")

        validation_result = validation_engine.validate_extraction_package(payload)
        return validation_result
    except Exception as err:
        raise HTTPException(status_code=500, detail=f"Validation Engine Processing Failed: {str(err)}")

@router.get("/validation/metadata")
async def get_validation_metadata():
    return {
        "engineVersion": validation_engine.ENGINE_VERSION,
        "masterDataVersion": validation_engine.MASTER_DATA_VERSION,
        "ruleSetVersion": validation_engine.RULESET_VERSION,
        "supportedDistricts": ["Kurnool (545)", "Nandyal (546)", "Anantapur (547)"],
    }
