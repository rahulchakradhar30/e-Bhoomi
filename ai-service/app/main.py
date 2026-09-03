from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.preprocess_router import router as preprocess_router
from app.api.ocr_router import router as ocr_router
from app.api.nlp_router import router as nlp_router
from app.api.translation_router import router as translation_router
from app.api.extraction_router import router as extraction_router
from app.api.confidence_router import router as confidence_router
from app.api.validation_router import router as validation_router
from app.api.integrations_router import router as integrations_router
from app.api.verification_router import router as verification_router

app = FastAPI(
    title="e-Bhoomi Python Document Processing AI Service",
    description="OpenCV pre-processing, Telugu OCR, Indic NLP, IndicTrans2 translation, AI/NLP extraction, confidence scoring, validation, cross-database verification & audit ledger service for Intelligent Land Record Digitization & Validation (SIH26018)",
    version="6.0.0",
)

# CORS configuration for secure Next.js API integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(preprocess_router)
app.include_router(ocr_router)
app.include_router(nlp_router)
app.include_router(translation_router)
app.include_router(extraction_router)
app.include_router(confidence_router)
app.include_router(validation_router)
app.include_router(integrations_router)
app.include_router(verification_router)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "e-Bhoomi OpenCV AI Processing Service",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
