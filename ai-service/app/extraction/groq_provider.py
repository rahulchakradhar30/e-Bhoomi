import os
import json
import urllib.request
import urllib.error
import time

class PythonGroqProvider:
    """
    Python Server-Side Groq Cloud AI Provider for e-Bhoomi (SIH26018).
    Executes JSON schema-constrained land record extraction.
    """

    PROVIDER_ID = "PROV-AI-GROQ"
    PROVIDER_NAME = "Groq Cloud Llama-3.3 AI Provider"
    PROMPT_VERSION = "groq-land-extraction-v1"

    def get_api_key(self) -> str:
        return os.environ.get("GROQ_API_KEY", "")

    def get_model(self) -> str:
        return os.environ.get("GROQ_MODEL", "openai/gpt-oss-120b")

    def extract_structured_record(self, payload: dict) -> dict:
        api_key = self.get_api_key().strip()
        model = self.get_model()

        if not api_key:
            return {
                "success": False,
                "status": "AI_PROVIDER_UNAVAILABLE",
                "errorReason": "GROQ_API_KEY environment variable missing or empty.",
                "modelUsed": model,
            }

        base_url = os.environ.get("GROQ_API_BASE_URL", "https://api.groq.com/openai/v1")
        url = f"{base_url}/chat/completions"

        text_to_process = (
            payload.get("llamaExtractedText")
            or payload.get("extractedText")
            or payload.get("fullText")
            or payload.get("translatedText")
            or payload.get("nlpText")
            or payload.get("rawOcrText")
            or ""
        )

        doc_type = (payload.get("documentCategory") or payload.get("documentType") or "ADANGAL").upper()

        system_prompt = (
            f"You are an expert Indian Land Record Data Extraction AI for e-Bhoomi (SIH26018, Andhra Pradesh Revenue Department).\n"
            f"Extract structured land record attributes and compute realistic confidence scores based on OCR text.\n"
            f"DOCUMENT TYPE: {doc_type}\n\n"
            "STRICT RULES:\n"
            "1. Extract ONLY facts supported by the text. If a field is missing, return null with confidence 0.0.\n"
            "2. overallConfidence MUST be the real average of the extracted fields (or 0.0 if nothing extracted). Never return fake hardcoded confidence.\n"
            "3. Output MUST be valid JSON with fields: documentType, documentTitle, documentTitleTe, overallConfidence, districtName, districtConfidence, districtEvidence, mandalName, mandalConfidence, mandalEvidence, villageName, villageConfidence, villageEvidence, surveyNumber, surveyConfidence, surveyEvidence, subDivisionNumber, subDivisionConfidence, khataNumber, khataConfidence, ownerName, ownerConfidence, ownerEvidence, fatherOrHusbandName, fatherConfidence, extentAcres, extentConfidence, landClassification, classificationConfidence, documentDate, boundaries, customSections, checklist."
        )

        user_prompt = f"Target Document Category: {doc_type}\nExtracted Document Text:\n{text_to_process}\n\nExtract and return the customized JSON object according to the schema."

        req_body = json.dumps({
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt + "\n\nOutput only valid JSON."},
            ],
            "temperature": 0.1,
            "max_tokens": 4096,
        }).encode("utf-8")

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) e-Bhoomi-LandRecord/1.0",
        }

        try:
            req = urllib.request.Request(url, data=req_body, headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=30) as resp:
                resp_data = json.loads(resp.read().decode("utf-8"))
                content_str = resp_data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
                if not content_str:
                    return {
                        "success": False,
                        "status": "AI_EXTRACTION_FAILED",
                        "errorReason": "Groq returned empty completion.",
                        "modelUsed": model,
                    }
                
                # Robust JSON extraction
                json_start = content_str.find("{")
                json_end = content_str.rfind("}")
                if json_start != -1 and json_end != -1:
                    content_str = content_str[json_start:json_end+1]

                extracted_record = json.loads(content_str)
                return {
                    "success": True,
                    "extractedRecord": extracted_record,
                    "status": "SUCCESS",
                    "modelUsed": model,
                    "rawMetadata": {
                        "promptVersion": self.PROMPT_VERSION,
                        "usage": resp_data.get("usage"),
                    },
                }
        except urllib.error.HTTPError as err:
            err_msg = err.read().decode("utf-8", errors="replace")[:150]
            return {
                "success": False,
                "status": "AI_EXTRACTION_FAILED",
                "errorReason": f"Groq HTTP Error {err.code}: {err_msg}",
                "modelUsed": model,
            }
        except Exception as err:
            return {
                "success": False,
                "status": "AI_EXTRACTION_FAILED",
                "errorReason": f"Groq Client Exception: {str(err)}",
                "modelUsed": model,
            }
