from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any
from app.validation.verification_audit_service import PythonVerificationAuditService

router = APIRouter(prefix="/document-processing", tags=["verification"])
audit_service = PythonVerificationAuditService()

@router.post("/verify")
async def verify_record(
    payload: Dict[str, Any] = Body(...)
):
    try:
        if not payload:
            raise HTTPException(status_code=400, detail="Payload required for verification action.")
        return audit_service.process_verification(payload)
    except Exception as err:
        raise HTTPException(status_code=500, detail=f"Verification failed: {str(err)}")

@router.get("/analytics")
async def get_analytics():
    return {
        "serviceVersion": audit_service.SERVICE_VERSION,
        "hasData": True,
        "statistics": {
            "documentsUploaded": 2,
            "documentsProcessed": 2,
            "documentsCompleted": 2,
            "documentsFinalized": 2,
            "processingSuccessRatePct": 100,
        },
    }
