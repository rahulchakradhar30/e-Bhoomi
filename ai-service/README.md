# e-Bhoomi — Python OpenCV Document Processing Service (Phase 1A)

Dedicated server-side Python service providing OpenCV document pre-processing foundation for **e-Bhoomi** (SIH26018 — Intelligent Land Record Digitization & Validation).

---

## Capabilities & Architecture
- **PDF Page Extraction & Image Rendering**: Multi-page PDF page parsing.
- **OpenCV Image Normalization**: Contrast normalization via CLAHE and brightness balance.
- **Adaptive Deskewing**: Orientation and skew angle detection via Hough lines and contour analysis.
- **Denoising**: Bilateral filtering preserving document gridlines, table borders, and text edges.
- **Diagnostics**: Blur detection (Laplacian variance), skew angle computation, low contrast identification.
- **Structure Preservation**: Table border preservation & Cadastral map / diagram candidate classification (`MAP_OR_DIAGRAM`).
- **Non-Destructive**: Original file remains untouched; preprocessed images generated separately.

---

## Setup & Running

### Requirements
- Python 3.9+
- `pip install -r requirements.txt`

### Start Service
```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Health Check
```
GET http://127.0.0.1:8000/health
```

### Preprocessing API Endpoint
```
POST http://127.0.0.1:8000/document-processing/preprocess
Form-Data: file=<file_bytes>
```
