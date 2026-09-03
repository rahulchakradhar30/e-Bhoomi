from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any
from app.validation.cross_database_verifier import PythonCrossDatabaseVerifier

router = APIRouter(prefix="/document-processing", tags=["integrations"])
verifier = PythonCrossDatabaseVerifier()

@router.post("/cross-verify")
async def cross_verify(
    payload: Dict[str, Any] = Body(...)
):
    try:
        if not payload:
            raise HTTPException(status_code=400, detail="Payload required for cross-database verification.")
        return verifier.verify_record(payload)
    except Exception as err:
        raise HTTPException(status_code=500, detail=f"Cross-database verification failed: {str(err)}")

@router.get("/integrations/status")
async def get_integrations_status():
    return {
        "engineVersion": verifier.ENGINE_VERSION,
        "matcherVersion": verifier.MATCHER_VERSION,
        "providers": [
            {"providerId": "PROV-LRMS-01", "name": "Andhra Pradesh LRMS", "status": "UNAVAILABLE", "reason": "Endpoint unconfigured (LRMS_API_BASE_URL missing)."},
            {"providerId": "PROV-DILRMP-01", "name": "Digital India Land Records", "status": "UNAVAILABLE", "reason": "Endpoint unconfigured (DILRMP_API_BASE_URL missing)."},
            {"providerId": "PROV-TEST-LOCAL", "name": "Local Test Provider", "status": "TEST_MODE", "reason": "Available for automated test benchmarks."},
        ],
    }
