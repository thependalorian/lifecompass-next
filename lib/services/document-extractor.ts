// lib/services/document-extractor.ts
// Document extraction service using Groq for enhancement
// Purpose: Extract and enhance text from uploaded documents (PDF, Word, images, text)
// Uses Groq API for text enhancement, OCR error correction, and key point extraction

// Dynamic imports to avoid bundling issues with serverless functions
let pdfParse: any;
let mammoth: any;
let Tesseract: any;
let Groq: any;

// Lazy load dependencies (only when needed)
async function loadDependencies() {
  if (!pdfParse) {
    pdfParse = (await import("pdf-parse")).default;
  }
  if (!mammoth) {
    mammoth = await import("mammoth");
  }
  if (!Tesseract) {
    Tesseract = await import("tesseract.js");
  }
  if (!Groq) {
    Groq = (await import("groq-sdk")).default;
  }
}

// Initialize Groq client for document processing
let groqClient: any | null = null;

async function getGroqClient(): Promise<any | null> {
  await loadDependencies();

  if (!groqClient) {
    const { getEnvVar } = await import("@/lib/utils/env");
    const apiKey = getEnvVar("GROQ_API_KEY");
    if (!apiKey) {
      console.warn(
        "[DocumentExtractor] GROQ_API_KEY not set, Groq enhancement will be disabled",
      );
      return null;
    }

    try {
      groqClient = new Groq({
        apiKey: apiKey,
      });
    } catch (error) {
      console.error(
        "[DocumentExtractor] Failed to initialize Groq client:",
        error,
      );
      return null;
    }
  }
  return groqClient;
}

/**
 * Extract text from various file types
 * Supports: PDF, Word (.docx), Images (OCR), Text files
 */
export async function extractTextFromFile(
  fileBuffer: Buffer,
  contentType: string,
  filename: string,
): Promise<string> {
  await loadDependencies();

  try {
    // PDF
    if (
      contentType === "application/pdf" ||
      filename.toLowerCase().endsWith(".pdf")
    ) {
      const data = await pdfParse(fileBuffer);
      return data.text || "";
    }

    // Word Document (.docx)
    if (
      contentType.includes("word") ||
      contentType.includes("document") ||
      filename.toLowerCase().endsWith(".docx")
    ) {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      return result.value || "";
    }

    // Images (OCR)
    if (contentType.startsWith("image/")) {
      return await extractTextFromImage(fileBuffer, contentType);
    }

    // Text files
    if (
      contentType.startsWith("text/") ||
      filename.toLowerCase().endsWith(".txt")
    ) {
      return fileBuffer.toString("utf-8");
    }

    throw new Error(`Unsupported file type: ${contentType}`);
  } catch (error) {
    console.error("[DocumentExtractor] Text extraction failed:", error);
    throw new Error(
      `Failed to extract text from ${filename}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Extract text from images using Groq Vision (primary) or Tesseract (fallback)
 */
async function extractTextFromImage(
  fileBuffer: Buffer,
  contentType: string,
): Promise<string> {
  await loadDependencies();
  const groq = await getGroqClient();

  // Try Groq Vision API first (if Groq is available)
  if (groq) {
    try {
      const base64Image = fileBuffer.toString("base64");
      const response = await groq.chat.completions.create({
        model:
          process.env.DOCUMENT_PROCESSING_MODEL || "llama-3.1-70b-versatile",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract all text from this image. Return only the extracted text, no explanations or formatting.",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${contentType};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 4000,
        temperature: 0.1, // Low temperature for accurate extraction
      });

      const extractedText = response.choices[0]?.message?.content || "";
      if (extractedText.trim()) {
        console.log(
          "[DocumentExtractor] Successfully extracted text using Groq Vision",
        );
        return extractedText;
      }
    } catch (error) {
      console.warn(
        "[DocumentExtractor] Groq Vision failed, falling back to Tesseract:",
        error,
      );
    }
  }

  // Fallback to Tesseract OCR
  console.log("[DocumentExtractor] Using Tesseract OCR for image extraction");
  const {
    data: { text },
  } = await Tesseract.default.recognize(fileBuffer, "eng");
  return text || "";
}

/**
 * Enhanced text extraction with Groq for post-processing
 * Uses Groq to clean, summarize, and extract structured data from extracted text
 */
export async function enhanceExtractedTextWithGroq(
  extractedText: string,
  documentType?: string,
  filename?: string,
): Promise<{
  cleanedText: string;
  summary?: string;
  keyPoints?: string[];
  metadata?: Record<string, any>;
}> {
  await loadDependencies();
  const groq = await getGroqClient();

  if (!groq) {
    console.warn(
      "[DocumentExtractor] Groq not available, returning original text",
    );
    return {
      cleanedText: extractedText,
    };
  }

  if (!extractedText || extractedText.trim().length === 0) {
    return {
      cleanedText: extractedText,
    };
  }

  try {
    // Truncate text if too long (Groq has token limits)
    const maxLength = 8000; // Leave room for prompt
    const truncatedText =
      extractedText.length > maxLength
        ? extractedText.substring(0, maxLength) + "...[truncated]"
        : extractedText;

    const prompt = `You are a document processing assistant. Process the following extracted text from a ${documentType || "document"}${filename ? ` (filename: ${filename})` : ""}:

${truncatedText}

Tasks:
1. Clean the text (fix OCR errors, remove artifacts, normalize spacing)
2. Extract key information and important points
3. Provide a brief summary (2-3 sentences)

Return JSON format:
{
  "cleanedText": "cleaned and corrected text",
  "summary": "brief summary",
  "keyPoints": ["key point 1", "key point 2", ...]
}`;

    const response = await groq.chat.completions.create({
      model:
        process.env.DOCUMENT_PROCESSING_MODEL ||
        process.env.LLM_CHOICE ||
        "llama-3.1-70b-versatile",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
      temperature: 0.3, // Lower temperature for more consistent extraction
    });

    const result = JSON.parse(response.choices[0]?.message?.content || "{}");

    return {
      cleanedText: result.cleanedText || extractedText,
      summary: result.summary,
      keyPoints: result.keyPoints || [],
      metadata: {
        originalLength: extractedText.length,
        cleanedLength: result.cleanedText?.length || extractedText.length,
        enhancementModel:
          process.env.DOCUMENT_PROCESSING_MODEL || "llama-3.1-70b-versatile",
      },
    };
  } catch (error) {
    console.error("[DocumentExtractor] Groq enhancement failed:", error);
    // Return original text if enhancement fails
    return {
      cleanedText: extractedText,
    };
  }
}

/**
 * Classify document type using Groq
 * Auto-categorizes documents (Claims, Identity, Policy, Supporting)
 */
export async function classifyDocumentWithGroq(
  text: string,
  filename: string,
): Promise<{
  category: string;
  documentType: string;
  confidence: number;
}> {
  await loadDependencies();
  const groq = await getGroqClient();

  if (!groq) {
    // Fallback classification based on filename
    return classifyByFilename(filename);
  }

  try {
    const prompt = `Classify this document based on its content and filename. Return JSON:
{
  "category": "Claims|Identity|Policy|Supporting",
  "documentType": "Police Report|ID Document|Repair Quote|Policy Application|Bank Statement|...",
  "confidence": 0.0-1.0
}

Filename: ${filename}
Text preview: ${text.substring(0, 1000)}${text.length > 1000 ? "..." : ""}`;

    const response = await groq.chat.completions.create({
      model: process.env.DOCUMENT_PROCESSING_MODEL || "llama-3.1-70b-versatile",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
      temperature: 0.2, // Low temperature for consistent classification
    });

    const result = JSON.parse(response.choices[0]?.message?.content || "{}");

    return {
      category: result.category || "Supporting",
      documentType: result.documentType || "Document",
      confidence: result.confidence || 0.5,
    };
  } catch (error) {
    console.error("[DocumentExtractor] Classification failed:", error);
    return classifyByFilename(filename);
  }
}

/**
 * Fallback classification based on filename patterns
 */
function classifyByFilename(filename: string): {
  category: string;
  documentType: string;
  confidence: number;
} {
  const lowerFilename = filename.toLowerCase();

  // Claims documents
  if (
    lowerFilename.includes("police") ||
    lowerFilename.includes("accident") ||
    lowerFilename.includes("claim")
  ) {
    return {
      category: "Claims",
      documentType: "Police Report",
      confidence: 0.7,
    };
  }
  if (
    lowerFilename.includes("repair") ||
    lowerFilename.includes("quote") ||
    lowerFilename.includes("estimate")
  ) {
    return {
      category: "Claims",
      documentType: "Repair Quote",
      confidence: 0.7,
    };
  }
  if (lowerFilename.includes("medical") || lowerFilename.includes("hospital")) {
    return {
      category: "Claims",
      documentType: "Medical Report",
      confidence: 0.7,
    };
  }

  // Identity documents
  if (
    lowerFilename.includes("id") ||
    lowerFilename.includes("passport") ||
    lowerFilename.includes("license")
  ) {
    return {
      category: "Identity",
      documentType: "ID Document",
      confidence: 0.7,
    };
  }
  if (
    lowerFilename.includes("address") ||
    lowerFilename.includes("utility") ||
    lowerFilename.includes("bill")
  ) {
    return {
      category: "Identity",
      documentType: "Proof of Address",
      confidence: 0.7,
    };
  }

  // Policy documents
  if (
    lowerFilename.includes("policy") ||
    lowerFilename.includes("application")
  ) {
    return {
      category: "Policy",
      documentType: "Policy Application",
      confidence: 0.7,
    };
  }

  // Default
  return { category: "Supporting", documentType: "Document", confidence: 0.3 };
}

/**
 * Extract structured data from document using Groq
 * Useful for extracting dates, amounts, names, etc.
 */
export async function extractStructuredDataWithGroq(
  text: string,
  documentType?: string,
): Promise<Record<string, any>> {
  await loadDependencies();
  const groq = await getGroqClient();

  if (!groq) {
    return {};
  }

  try {
    const prompt = `Extract structured data from this ${documentType || "document"}. Return JSON with relevant fields:
{
  "dates": ["date1", "date2"],
  "amounts": ["amount1", "amount2"],
  "names": ["name1", "name2"],
  "referenceNumbers": ["ref1", "ref2"],
  "locations": ["location1", "location2"]
}

Text:
${text.substring(0, 6000)}${text.length > 6000 ? "...[truncated]" : ""}`;

    const response = await groq.chat.completions.create({
      model: process.env.DOCUMENT_PROCESSING_MODEL || "llama-3.1-70b-versatile",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500,
      temperature: 0.2,
    });

    return JSON.parse(response.choices[0]?.message?.content || "{}");
  } catch (error) {
    console.error(
      "[DocumentExtractor] Structured data extraction failed:",
      error,
    );
    return {};
  }
}
