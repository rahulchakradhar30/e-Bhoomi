from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from typing import Optional
from app.preprocessing.document_preprocessor import DocumentPreprocessor
from app.schemas.schemas import DocumentPreprocessResponse

router = APIRouter(prefix="/document-processing", tags=["preprocessing"])
preprocessor = DocumentPreprocessor()

@router.post("/preprocess", response_model=DocumentPreprocessResponse)
async def preprocess_document(
    file: UploadFile = File(...),
    documentType: Optional[str] = Form(None)
):
    try:
        contents = await file.read()
        if not contents:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        res = preprocessor.process_file(
            file_bytes=contents,
            file_name=file.filename or "uploaded_document.pdf",
            mime_type=file.content_type or "application/pdf"
        )
        return res
    except Exception as err:
        raise HTTPException(status_code=500, detail=f"OpenCV Preprocessing Failed: {str(err)}")
