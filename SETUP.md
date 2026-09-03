# e-Bhoomi — Hackathon Deployment & Setup Guide
SIH26018 — Intelligent Land Record Digitization & Validation

This guide provides instructions to launch the complete e-Bhoomi platform from a clean environment.

---

## 1. System Requirements
- Node.js: v18.0.0 or higher
- Python: v3.10 or higher
- Tesseract OCR (Optional for local English OCR execution)

---

## 2. Environment Variables Configuration (`.env.local`)

Create `.env.local` in the project root:

```env
# Next.js Application Environment
NEXT_PUBLIC_APP_ENV=production
PYTHON_AI_SERVICE_URL=http://127.0.0.1:8000

# Server-Side AI Provider Configuration (Zero client exposure)
AI_PROVIDER=OPENAI_COMPATIBLE
AI_MODEL=eBhoomi-LandRecord-NER-v7.0
AI_API_KEY=your_server_side_key_here
AI_BASE_URL=https://api.openai.com/v1

# Government LRMS & DILRMP Adapter Configuration
LRMS_API_BASE_URL=https://meebhoomi.ap.gov.in/api
DILRMP_API_BASE_URL=https://dilrmp.gov.in/api
```

---

## 3. Python AI Processing Service Launch

```bash
# Navigate to Python AI service directory
cd ai-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start Python FastAPI server (Port 8000)
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

---

## 4. Next.js Web Platform Launch

```bash
# Install Node dependencies
npm install

# Run TypeScript type check
npx tsc --noEmit

# Run production build
npm run build

# Start Next.js server (Port 3000)
npm run start
```

---

## 5. Verification Commands

```bash
# Run complete Phase 7 End-to-End Test Benchmark
python scripts/benchmark_phase7.py
```
