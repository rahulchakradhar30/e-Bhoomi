export interface LlamaExtractedPage {
  pageNumber: number;
  text: string;
  language: string;
  source: string;
}

export interface LlamaExtractionResult {
  success: boolean;
  status: string;
  provider: string;
  model: string;
  language: string;
  pageCount: number;
  pages: LlamaExtractedPage[];
  fullText: string;
  processingMetadata?: {
    processingTimeMs?: number;
    timestamp?: string;
    [key: string]: any;
  };
  error?: string;
}

export class LlamaDocumentTextProvider {
  public providerId = 'PROV-LLAMA-TEXT';
  public providerName = 'Llama Document Text Extraction Engine';

  public getApiKey(): string {
    return (
      process.env.LLAMA_API_KEY ||
      process.env.LLAMA_CLOUD_API_KEY ||
      ''
    ).trim();
  }

  public getBaseUrl(): string {
    if (process.env.LLAMA_API_BASE_URL) {
      return process.env.LLAMA_API_BASE_URL.replace(/\/$/, '');
    }
    const key = this.getApiKey();
    if (key.startsWith('llx-')) {
      return 'https://api.cloud.llamaindex.ai/api/v1';
    }
    return 'https://api.llama-api.com';
  }

  public getModel(): string {
    return process.env.LLAMA_MODEL || 'agentic-latest';
  }

  public async healthCheck(): Promise<{ configured: boolean; model: string; baseUrl: string; status: string }> {
    const key = this.getApiKey();
    const configured = Boolean(key);
    return {
      configured,
      model: this.getModel(),
      baseUrl: this.getBaseUrl(),
      status: configured ? 'READY' : 'LLAMA_KEY_MISSING',
    };
  }

  /**
   * Extracts text from preprocessed pages or raw file buffers using Llama API.
   */
  public async extractTextFromPages(
    pages: Array<{ pageNumber: number; base64Preview?: string; imageBase64?: string }>,
    metadata?: { documentType?: string; fileName?: string; fileBuffer?: ArrayBuffer; mimeType?: string }
  ): Promise<LlamaExtractionResult> {
    const startTime = Date.now();
    const apiKey = this.getApiKey();
    const model = this.getModel();
    const baseUrl = this.getBaseUrl();

    // 1. Validate API Key Presence
    if (!apiKey) {
      console.warn('[LLAMA] Extraction aborted: LLAMA_API_KEY unconfigured.');
      return {
        success: false,
        status: 'LLAMA_KEY_MISSING',
        provider: this.providerId,
        model,
        language: 'te',
        pageCount: 0,
        pages: [],
        fullText: '',
        error: 'LLAMA_API_KEY is missing from the server environment. Please set LLAMA_API_KEY.',
        processingMetadata: {
          processingTimeMs: Date.now() - startTime,
        },
      };
    }

    if (!pages || pages.length === 0) {
      return {
        success: false,
        status: 'EMPTY_PAGES',
        provider: this.providerId,
        model,
        language: 'te',
        pageCount: 0,
        pages: [],
        fullText: '',
        error: 'No preprocessed pages provided for Llama text extraction.',
        processingMetadata: {
          processingTimeMs: Date.now() - startTime,
        },
      };
    }

    console.log(`[LLAMA] request started (model: ${model}, pages: ${pages.length})`);

    // 2. Delegate to LlamaCloud Parsing API if key is an LlamaCloud key (llx-...) or endpoint matches LlamaCloud
    if (apiKey.startsWith('llx-') || baseUrl.includes('llamaindex.ai') || baseUrl.includes('llama_cloud')) {
      return this._extractWithLlamaCloud(apiKey, baseUrl, pages, metadata, startTime);
    }

    // 3. Multimodal Chat Completions API
    return this._extractWithChatCompletions(apiKey, baseUrl, model, pages, metadata, startTime);
  }

  /**
   * Handles LlamaCloud Parsing API flow (Upload -> Parse Job -> Result).
   */
  private async _extractWithLlamaCloud(
    apiKey: string,
    baseUrl: string,
    pages: Array<{ pageNumber: number; base64Preview?: string; imageBase64?: string }>,
    metadata: { documentType?: string; fileName?: string; fileBuffer?: ArrayBuffer; mimeType?: string } | undefined,
    startTime: number
  ): Promise<LlamaExtractionResult> {
    const model = this.getModel();
    const extractedPages: LlamaExtractedPage[] = [];
    let fullText = '';
    let overallLanguage = 'te';

    try {
      // Branch A: Direct Document Upload if whole fileBuffer is available (PDF/TIFF/Image)
      if (metadata?.fileBuffer && metadata.fileBuffer.byteLength > 0) {
        const fileName = metadata.fileName || 'document.pdf';
        const mimeType = metadata.mimeType || 'application/pdf';
        const fileBlob = new Blob([metadata.fileBuffer], { type: mimeType });

        const formData = new FormData();
        formData.append('file', fileBlob, fileName);
        formData.append('tier', 'agentic');
        formData.append('version', 'latest');

        const uploadUrl = `${baseUrl}/parsing/upload`;
        const uploadRes = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'User-Agent': 'e-Bhoomi-LlamaCloudClient/1.0',
          },
          body: formData,
        });

        if (!uploadRes.ok) {
          const errText = await uploadRes.text();
          const isAuthError = uploadRes.status === 401 || uploadRes.status === 403;
          const isModelError = uploadRes.status === 404 || errText.toLowerCase().includes('model');
          const status = isAuthError
            ? 'LLAMA_AUTH_FAILED'
            : isModelError
            ? 'LLAMA_MODEL_UNAVAILABLE'
            : 'LLAMA_REQUEST_FAILED';

          return {
            success: false,
            status,
            provider: this.providerId,
            model,
            language: overallLanguage,
            pageCount: 0,
            pages: [],
            fullText: '',
            error: `LlamaCloud API Error ${uploadRes.status}: ${errText.substring(0, 150)}`,
            processingMetadata: { processingTimeMs: Date.now() - startTime },
          };
        }

        const jobData = await uploadRes.json();
        const jobId = jobData.id || jobData.job_id;

        if (!jobId) {
          return {
            success: false,
            status: 'LLAMA_RESPONSE_INVALID',
            provider: this.providerId,
            model,
            language: overallLanguage,
            pageCount: 0,
            pages: [],
            fullText: '',
            error: 'LlamaCloud did not return a valid parsing job ID.',
            processingMetadata: { processingTimeMs: Date.now() - startTime },
          };
        }

        // Poll job status until SUCCESS or ERROR (max 60s)
        const pollStart = Date.now();
        let jobSucceeded = false;
        while (Date.now() - pollStart < 60000) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          const jobStatusRes = await fetch(`${baseUrl}/parsing/job/${jobId}`, {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'User-Agent': 'e-Bhoomi-LlamaCloudClient/1.0',
            },
          });

          if (!jobStatusRes.ok) continue;

          const statusJson = await jobStatusRes.json();
          if (statusJson.status === 'SUCCESS') {
            jobSucceeded = true;
            break;
          } else if (statusJson.status === 'ERROR') {
            console.error(`[LLAMA] Parsing job failed: ${statusJson.error_message || 'Unknown error'}`);
            break;
          }
        }

        if (jobSucceeded) {
          // Fetch markdown and structured json
          try {
            const jsonRes = await fetch(`${baseUrl}/parsing/job/${jobId}/result/json`, {
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'User-Agent': 'e-Bhoomi-LlamaCloudClient/1.0',
              },
            });
            if (jsonRes.ok) {
              const resJson = await jsonRes.json();
              if (Array.isArray(resJson.pages) && resJson.pages.length > 0) {
                resJson.pages.forEach((p: any, idx: number) => {
                  const pText = p.md || p.text || '';
                  const isEng = /[a-zA-Z]/.test(pText) && !/[\u0C00-\u0C7F]/.test(pText);
                  extractedPages.push({
                    pageNumber: p.page || idx + 1,
                    text: pText,
                    language: isEng ? 'en' : 'te',
                    source: 'llama_cloud',
                  });
                });
              }
            }
          } catch (e) {
            console.warn('[LLAMA] Could not fetch result json, falling back to markdown', e);
          }

          if (extractedPages.length === 0) {
            const mdRes = await fetch(`${baseUrl}/parsing/job/${jobId}/result/markdown`, {
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'User-Agent': 'e-Bhoomi-LlamaCloudClient/1.0',
              },
            });
            if (mdRes.ok) {
              const mdJson = await mdRes.json();
              fullText = mdJson.markdown || mdJson.text || '';
              const isEng = /[a-zA-Z]/.test(fullText) && !/[\u0C00-\u0C7F]/.test(fullText);
              extractedPages.push({
                pageNumber: 1,
                text: fullText,
                language: isEng ? 'en' : 'te',
                source: 'llama_cloud',
              });
            }
          } else {
            fullText = extractedPages.map((p) => p.text).join('\n\n');
          }
        }
      } else {
        // Branch B: Process individual page images
        for (const page of pages) {
          const pageNum = page.pageNumber || 1;
          const b64 = page.base64Preview || page.imageBase64 || '';
          if (!b64) continue;

          const rawBase64 = b64.replace(/^data:image\/\w+;base64,/, '');
          const binaryStr = Buffer.from(rawBase64, 'base64');
          const fileBlob = new Blob([binaryStr], { type: 'image/jpeg' });
          const fileName = `${metadata?.fileName || 'document'}_page_${pageNum}.jpg`;

          const formData = new FormData();
          formData.append('file', fileBlob, fileName);
          formData.append('tier', 'agentic');
          formData.append('version', 'latest');

          const uploadUrl = `${baseUrl}/parsing/upload`;
          const uploadRes = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'User-Agent': 'e-Bhoomi-LlamaCloudClient/1.0',
            },
            body: formData,
          });

          if (!uploadRes.ok) continue;
          const jobData = await uploadRes.json();
          const jobId = jobData.id || jobData.job_id;
          if (!jobId) continue;

          let pageText = '';
          const pollStart = Date.now();
          while (Date.now() - pollStart < 45000) {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            const jobStatusRes = await fetch(`${baseUrl}/parsing/job/${jobId}`, {
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'User-Agent': 'e-Bhoomi-LlamaCloudClient/1.0',
              },
            });

            if (!jobStatusRes.ok) continue;
            const statusJson = await jobStatusRes.json();
            if (statusJson.status === 'SUCCESS') {
              const resultRes = await fetch(`${baseUrl}/parsing/job/${jobId}/result/markdown`, {
                headers: {
                  'Authorization': `Bearer ${apiKey}`,
                  'User-Agent': 'e-Bhoomi-LlamaCloudClient/1.0',
                },
              });
              if (resultRes.ok) {
                const resJson = await resultRes.json();
                pageText = resJson.markdown || resJson.text || '';
              }
              break;
            } else if (statusJson.status === 'ERROR') {
              break;
            }
          }

          const isEnglish = /[a-zA-Z]/.test(pageText) && !/[\u0C00-\u0C7F]/.test(pageText);
          extractedPages.push({
            pageNumber: pageNum,
            text: pageText,
            language: isEnglish ? 'en' : 'te',
            source: 'llama_cloud',
          });
        }
        fullText = extractedPages.map((p) => p.text).join('\n\n');
      }

      console.log(`[LLAMA] request completed`);
      console.log(`[LLAMA] text characters returned: ${fullText.length}`);

      if (!fullText.trim()) {
        return {
          success: false,
          status: 'TEXT_EXTRACTION_EMPTY',
          provider: this.providerId,
          model,
          language: overallLanguage,
          pageCount: extractedPages.length,
          pages: extractedPages,
          fullText: '',
          error: 'LlamaCloud returned empty text for the uploaded document.',
          processingMetadata: {
            processingTimeMs: Date.now() - startTime,
          },
        };
      }

      return {
        success: true,
        status: 'COMPLETED',
        provider: this.providerId,
        model,
        language: overallLanguage,
        pageCount: extractedPages.length,
        pages: extractedPages,
        fullText,
        processingMetadata: {
          processingTimeMs: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (err: any) {
      console.error(`[LLAMA] LlamaCloud exception: ${err.message}`);
      return {
        success: false,
        status: 'LLAMA_REQUEST_FAILED',
        provider: this.providerId,
        model,
        language: overallLanguage,
        pageCount: extractedPages.length,
        pages: extractedPages,
        fullText: fullText || extractedPages.map((p) => p.text).join('\n\n'),
        error: `LlamaCloud Request Exception: ${err.message}`,
        processingMetadata: {
          processingTimeMs: Date.now() - startTime,
        },
      };
    }
  }

  /**
   * Handles OpenAI-compatible Multimodal Chat Completions API.
   */
  private async _extractWithChatCompletions(
    apiKey: string,
    baseUrl: string,
    model: string,
    pages: Array<{ pageNumber: number; base64Preview?: string; imageBase64?: string }>,
    metadata: { documentType?: string; fileName?: string } | undefined,
    startTime: number
  ): Promise<LlamaExtractionResult> {
    const extractedPages: LlamaExtractedPage[] = [];
    const fullTextParts: string[] = [];
    let overallLanguage = 'te';

    for (const page of pages) {
      const pageNum = page.pageNumber || 1;
      const b64 = page.base64Preview || page.imageBase64 || '';
      const imageUrl = b64.startsWith('data:') ? b64 : `data:image/jpeg;base64,${b64}`;

      const systemPrompt =
        'You are an expert document text transcription engine for Indian revenue and historical land-record documents (Telugu and English).\n' +
        'Extract all visible text from the document page verbatim.\n' +
        'Rules:\n' +
        '1. Transcribe printed and handwritten Telugu and English text accurately.\n' +
        '2. Preserve structural layouts, tabular lines, survey numbers, khata numbers, names, and extents.\n' +
        '3. Do NOT invent or hallucinate text that is not visible on the document.\n' +
        '4. Return only the extracted document text.';

      const userContent: any[] = [
        {
          type: 'text',
          text: `Please transcribe all visible text from this historical land-record page (Page ${pageNum}).`,
        },
      ];

      if (b64) {
        userContent.push({
          type: 'image_url',
          image_url: { url: imageUrl },
        });
      }

      try {
        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'User-Agent': 'e-Bhoomi-LlamaProvider/1.0',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userContent },
            ],
            temperature: 0.1,
            max_tokens: 2048,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          const isAuthError = response.status === 401 || response.status === 403;
          const isModelError =
            response.status === 404 ||
            (response.status === 400 && (
              errText.toLowerCase().includes('model') ||
              errText.toLowerCase().includes('not found') ||
              errText.toLowerCase().includes('does not exist') ||
              errText.toLowerCase().includes('invalid_model')
            ));

          const status = isAuthError
            ? 'LLAMA_AUTH_FAILED'
            : isModelError
            ? 'LLAMA_MODEL_UNAVAILABLE'
            : 'LLAMA_REQUEST_FAILED';

          console.error(`[LLAMA] request error (${response.status}): ${errText.substring(0, 150)}`);
          return {
            success: false,
            status,
            provider: this.providerId,
            model,
            language: overallLanguage,
            pageCount: extractedPages.length,
            pages: extractedPages,
            fullText: fullTextParts.join('\n\n'),
            error: isModelError
              ? `Llama Model '${model}' is unavailable on endpoint: ${errText.substring(0, 150)}`
              : `Llama API Error ${response.status}: ${errText.substring(0, 150)}`,
            processingMetadata: {
              failedAtPage: pageNum,
              processingTimeMs: Date.now() - startTime,
            },
          };
        }

        const data = await response.json();
        const pageText = data.choices?.[0]?.message?.content?.trim() || '';

        const isEnglish = /[a-zA-Z]/.test(pageText) && !/[\u0C00-\u0C7F]/.test(pageText);
        const pageLang = isEnglish ? 'en' : 'te';
        if (pageLang === 'en' && overallLanguage === 'te' && extractedPages.length === 0) {
          overallLanguage = 'en';
        }

        extractedPages.push({
          pageNumber: pageNum,
          text: pageText,
          language: pageLang,
          source: 'llama',
        });
        fullTextParts.push(pageText);
      } catch (fetchErr: any) {
        console.error(`[LLAMA] request failed: ${fetchErr.message}`);
        return {
          success: false,
          status: 'LLAMA_REQUEST_FAILED',
          provider: this.providerId,
          model,
          language: overallLanguage,
          pageCount: extractedPages.length,
          pages: extractedPages,
          fullText: fullTextParts.join('\n\n'),
          error: `Llama Request Failed: ${fetchErr.message}`,
          processingMetadata: {
            failedAtPage: pageNum,
            processingTimeMs: Date.now() - startTime,
          },
        };
      }
    }

    const fullText = fullTextParts.join('\n\n');
    console.log(`[LLAMA] request completed`);
    console.log(`[LLAMA] text characters returned: ${fullText.length}`);

    if (!fullText.trim()) {
      return {
        success: false,
        status: 'TEXT_EXTRACTION_EMPTY',
        provider: this.providerId,
        model,
        language: overallLanguage,
        pageCount: extractedPages.length,
        pages: extractedPages,
        fullText: '',
        error: 'Llama returned empty text for the uploaded document.',
        processingMetadata: {
          processingTimeMs: Date.now() - startTime,
        },
      };
    }

    return {
      success: true,
      status: 'COMPLETED',
      provider: this.providerId,
      model,
      language: overallLanguage,
      pageCount: extractedPages.length,
      pages: extractedPages,
      fullText,
      processingMetadata: {
        processingTimeMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      },
    };
  }
}

export const llamaDocumentTextProvider = new LlamaDocumentTextProvider();
