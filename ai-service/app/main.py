from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.preprocess_router import router as preprocess_router
from app.api.ocr_router import router as ocr_router

app = FastAPI(
    title="e-Bhoomi Python Document Processing AI Service",
    description="OpenCV document pre-processing & Telugu OCR foundation service for Intelligent Land Record Digitization & Validation (SIH26018)",
    version="1.1.0",
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
