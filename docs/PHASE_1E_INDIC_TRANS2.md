# e-Bhoomi — Phase 1E: Telugu ↔ English Language Processing Using IndicTrans2

## Overview
Phase 1E integrates **AI4Bharat IndicTrans2** as a controlled, server-side Telugu ↔ English translation layer for **e-Bhoomi** (SIH26018 — Intelligent Land Record Digitization & Validation). Consuming the Phase 1D Indic NLP processed text, it produces a high-fidelity English translation layer while preserving all previous text representations (`rawOCRText`, `normalizedOCRText`, `nlpProcessedText`), land-record terminology, survey numbers, owner names, page structures, and region metadata.

---

## 1. IndicTrans2 Model Source & License Verification
- **Official Repository**: [AI4Bharat/IndicTrans2](https://github.com/AI4Bharat/IndicTrans2)
- **Primary Model Checkpoint**: [ai4bharat/indictrans2-indic-en-1B](https://huggingface.co/ai4bharat/indictrans2-indic-en-1B) (Telugu -> English, Language pair: `tel_Tel` -> `eng_Latn`).
- **Reverse Model Checkpoint**: [ai4bharat/indictrans2-en-indic-1B](https://huggingface.co/ai4bharat/indictrans2-en-indic-1B) (English -> Telugu, Language pair: `eng_Latn` -> `tel_Tel`).
- **License**: **MIT License / Open Research Model Weights** (Authorized for open research, government digitization, and system deployment).

---

## 2. Pluggable Translation Provider Architecture (`BaseTranslationProvider`)
Phase 1E establishes an abstract provider architecture to prevent hardcoding model internals:

```
              BaseTranslationProvider (Abstract Interface)
                                  │
                                  ▼
                        IndicTrans2Provider
           (ai4bharat/indictrans2-indic-en-1B / tel_Tel -> eng_Latn)
```

---

## 3. Strict Identifier & Name Preservation Policy

> [!IMPORTANT]
> **Preservation Rules for Land Records**:
> 1. **Personal Owner Names**: Personal owner names (e.g. `కె. రామారావు`) are NEVER translated into generic English dictionary words; they retain their exact source identity representation.
> 2. **Land Numbers & Extents**: Survey numbers (`142/3A`, `42-A`), sub-division numbers, khata numbers (`482`), extents (`2.45`), dates (`15.06.2004`), and years are masked before translation and unmasked after translation to guarantee 100% numerical fidelity.

---

## 4. Traceable Four-Layer Output Schema
The system maintains 4 distinct, non-destructive text layers:
1. `rawOCRText`: Original neural OCR output (Phase 1B/1C).
2. `normalizedOCRText`: Phase 1B/1C NFKC output.
3. `nlpProcessedText`: Phase 1D Indic NLP tokenized & segmented output.
4. `translatedText`: Phase 1E IndicTrans2 English translation.

```json
{
  "translationId": "TRANS-1741123456",
  "status": "COMPLETED",
  "provider": "IndicTrans2Provider",
  "model": "ai4bharat/indictrans2-indic-en-1B",
  "sourceLanguage": "te",
  "targetLanguage": "en",
  "device": "cpu",
  "pageCount": 1,
  "pages": [
    {
      "pageNumber": 1,
      "status": "COMPLETED",
      "rawOCRText": "ఆంధ్రప్రదేశ్ ప్రభుత్వం రెవెన్యూ రికార్డు\nసర్వే నంబరు: 142/3A",
      "normalizedOCRText": "ఆంధ్రప్రదేశ్ ప్రభుత్వం రెవెన్యూ రికార్డు\nసర్వే నంబరు: 142/3A",
      "nlpProcessedText": "ఆంధ్రప్రదేశ్ ప్రభుత్వం రెవెన్యూ రికార్డు\nసర్వే నంబరు: 142/3A",
      "translatedText": "Government of Andhra Pradesh Revenue Record\nSurvey Number: 142/3A",
      "segments": [
        {
          "source": "ఆంధ్రప్రదేశ్ ప్రభుత్వం రెవెన్యూ రికార్డు",
          "target": "Government of Andhra Pradesh Revenue Record"
        },
        {
          "source": "సర్వే నంబరు: 142/3A",
          "target": "Survey Number: 142/3A"
        }
      ]
    }
  ],
  "rawOCRText": "ఆంధ్రప్రదేశ్ ప్రభుత్వం రెవెన్యూ రికార్డు\nసర్వే నంబరు: 142/3A",
  "normalizedOCRText": "ఆంధ్రప్రదేశ్ ప్రభుత్వం రెవెన్యూ రికార్డు\nసర్వే నంబరు: 142/3A",
  "nlpProcessedText": "ఆంధ్రప్రదేశ్ ప్రభుత్వం రెవెన్యూ రికార్డు\nసర్వే నంబరు: 142/3A",
  "translatedText": "Government of Andhra Pradesh Revenue Record\nSurvey Number: 142/3A",
  "overallStatus": "READY_FOR_AI_EXTRACTION",
  "processedAt": "2026-09-03T22:00:00Z",
  "processingTimeMs": 210
}
```

---

## 5. Truthful Model Availability & Fallback Policy
- **CPU / GPU Auto-Detection**: Auto-detects CUDA GPU (`cuda`) vs CPU (`cpu`) via `torch.cuda.is_available()`.
- **Truthful Status**: If IndicTrans2 model weights are uninitialized, returns status `TRANSLATION_MODEL_UNAVAILABLE` while fully preserving all previous OCR and NLP layers (`rawOCRText`, `normalizedOCRText`, `nlpProcessedText`). Zero fake translation text is generated.

---

## 6. Developer Benchmark Script (`scripts/benchmark_translation.py`)
Run translation performance evaluations:
```bash
python scripts/benchmark_translation.py --text "ఆంధ్రప్రదేశ్ ప్రభుత్వం రెవెన్యూ రికార్డు, సర్వే నంబరు: 142/3A"
```
Measures translation processing duration, character counts, segment counts, and numerical preservation.

---

## 7. Next Integration Point (Phase 2 / AI Land Record Extraction)
At the conclusion of Phase 1E, the dual-language document package carries status `READY_FOR_AI_EXTRACTION`. Phase 2 (AI Structured Land Record Extraction) will consume BOTH the **Telugu Source Text** and the **English Translation Layer** for dual-language evidence chain validation.
