// lib/agent/providers.ts

import OpenAI from "openai";
import { HfInference } from "@huggingface/inference";
import { getEnvVar, getEnvVarWithFallback, isDevelopment } from "@/lib/utils/env";

export interface LLMConfig {
  apiKey: string;
  baseURL: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export class DeepSeekProvider {
  private client: OpenAI;
  private model: string;
  private temperature: number;
  private maxTokens: number;

  constructor(config: LLMConfig) {
    // Ensure API key doesn't have Bearer prefix (OpenAI client adds it automatically)
    const cleanApiKey = config.apiKey.replace(/^Bearer\s+/i, "").trim();

    this.client = new OpenAI({
      apiKey: cleanApiKey,
      baseURL: config.baseURL,
    });
    this.model = config.model;
    this.temperature = config.temperature ?? 0.7;
    this.maxTokens = config.maxTokens ?? 1000;

    // Log configuration in development
    if (isDevelopment() || getEnvVar("DEBUG_LLM") === "true") {
      console.log(
        `[DeepSeek] Initialized with model: ${this.model}, baseURL: ${config.baseURL}`,
      );
    }
  }

  async chat(
    messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  ) {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: messages as any, // Type assertion to bypass strict typing
        temperature: this.temperature,
        max_tokens: this.maxTokens,
      });

      return response.choices[0].message.content || "";
    } catch (error: any) {
      // Enhanced error logging for DeepSeek API issues
      if (
        error.message?.includes("Model Not Exist") ||
        error.message?.includes("400")
      ) {
        console.error(
          `[DeepSeek] Model "${this.model}" not found. Available models: deepseek-chat, deepseek-coder, deepseek-reasoner`,
        );
        console.error(`[DeepSeek] Base URL: ${this.client.baseURL}`);
      }
      throw error;
    }
  }

  async streamChat(
    messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  ) {
    try {
      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages: messages as any, // Type assertion to bypass strict typing
        temperature: this.temperature,
        max_tokens: this.maxTokens,
        stream: true,
      });

      return stream;
    } catch (error: any) {
      // Enhanced error logging for DeepSeek API issues
      if (
        error.message?.includes("Model Not Exist") ||
        error.message?.includes("400")
      ) {
        console.error(
          `[DeepSeek] Model "${this.model}" not found. Available models: deepseek-chat, deepseek-coder, deepseek-reasoner`,
        );
        console.error(`[DeepSeek] Base URL: ${this.client.baseURL}`);
      }
      throw error;
    }
  }
}

// Factory function
export function getDeepSeekProvider(): DeepSeekProvider {
  // Use validated environment variables
  let apiKey = getEnvVar("DEEPSEEK_API_KEY") || getEnvVar("LLM_API_KEY");
  if (!apiKey) {
    throw new Error(
      "DEEPSEEK_API_KEY or LLM_API_KEY environment variable is required",
    );
  }

  // Strip "Bearer " prefix if present (common mistake when copying API keys)
  apiKey = apiKey.replace(/^Bearer\s+/i, "").trim();

  // Determine model name - DeepSeek supports: deepseek-chat, deepseek-coder, deepseek-reasoner
  // IMPORTANT: Trim any whitespace (trailing spaces cause "Model Not Exist" errors)
  const model = (
    getEnvVar("DEEPSEEK_MODEL") ||
    getEnvVar("LLM_CHOICE") ||
    "deepseek-chat"
  ).trim();
  const baseURL = (
    getEnvVar("DEEPSEEK_BASE_URL") ||
    getEnvVar("LLM_BASE_URL") ||
    "https://api.deepseek.com/v1"
  ).trim();

  // Log model selection for debugging (only in development or when explicitly enabled)
  if (isDevelopment() || getEnvVar("DEBUG_LLM") === "true") {
    console.log(`[DeepSeek] Using model: "${model}", baseURL: ${baseURL}`);
  }

  return new DeepSeekProvider({
    apiKey,
    baseURL,
    model,
    temperature: 0.7,
    maxTokens: 1000,
  });
}

// Embedding provider (using OpenAI-compatible API)
export class EmbeddingProvider {
  private client?: OpenAI;
  private provider: string;
  private baseURL: string;
  private apiKey: string;
  private model: string;
  private hfClient?: HfInference;

  constructor() {
    this.provider = getEnvVar("EMBEDDING_PROVIDER") || "ollama";

    // Determine base URL and API key based on provider
    if (this.provider === "ollama") {
      // Ollama for local development
      this.baseURL =
        getEnvVar("EMBEDDING_BASE_URL") || "http://localhost:11434/v1";
      this.apiKey = getEnvVar("EMBEDDING_API_KEY") || "ollama"; // Ollama doesn't require auth
      this.model = getEnvVar("EMBEDDING_MODEL") || "nomic-embed-text";
    } else if (this.provider === "huggingface" || this.provider === "hf") {
      // Hugging Face Inference API (FREE for many models)
      // Models: sentence-transformers/all-MiniLM-L6-v2 (384), sentence-transformers/all-mpnet-base-v2 (768)
      // Updated endpoint: https://router.huggingface.co/hf-inference (new API)
      this.baseURL =
        getEnvVar("EMBEDDING_BASE_URL") ||
        "https://router.huggingface.co/hf-inference";
      this.apiKey =
        getEnvVar("EMBEDDING_API_KEY") || getEnvVar("HUGGINGFACE_API_KEY") || "";
      this.model =
        getEnvVar("EMBEDDING_MODEL") ||
        "sentence-transformers/all-mpnet-base-v2"; // 768 dimensions
    } else if (this.provider === "google" || this.provider === "gemini") {
      // Google Gemini embeddings
      // Note: Google's embedding API uses different models - check if embedding model exists
      this.baseURL =
        getEnvVar("EMBEDDING_BASE_URL") ||
        "https://generativelanguage.googleapis.com/v1beta";
      const embeddingApiKey = getEnvVar("EMBEDDING_API_KEY");
      const googleApiKey = getEnvVar("GOOGLE_API_KEY");
      const apiKeyRaw = embeddingApiKey || googleApiKey || "";
      // Strip "Bearer " prefix if present
      this.apiKey = apiKeyRaw.replace(/^Bearer\s+/i, "").trim();
      // Google's embedding model - use models/text-embedding-004 for 768 dimensions
      // models/embedding-001 is also available but may have different dimensions
      this.model = getEnvVar("EMBEDDING_MODEL") || "models/text-embedding-004"; // 768 dimensions
    } else if (this.provider === "deepseek") {
      // DeepSeek embeddings (if they provide embedding API)
      this.baseURL =
        getEnvVar("EMBEDDING_BASE_URL") ||
        getEnvVar("DEEPSEEK_BASE_URL") ||
        "https://api.deepseek.com/v1";
      const embeddingApiKey = getEnvVar("EMBEDDING_API_KEY");
      const deepseekApiKey = getEnvVar("DEEPSEEK_API_KEY");
      const llmApiKey = getEnvVar("LLM_API_KEY");
      this.apiKey = embeddingApiKey || deepseekApiKey || llmApiKey || "";
      this.model = getEnvVar("EMBEDDING_MODEL") || "deepseek-embed";
    } else {
      // Default to Ollama for local development
      this.provider = "ollama";
      this.baseURL =
        getEnvVar("EMBEDDING_BASE_URL") || "http://localhost:11434/v1";
      this.apiKey = getEnvVar("EMBEDDING_API_KEY") || "ollama";
      this.model = getEnvVar("EMBEDDING_MODEL") || "nomic-embed-text";
    }

    // For production (Vercel), Ollama won't work (localhost), need alternative
    if (
      this.baseURL.includes("localhost") &&
      (getEnvVar("VERCEL") || !isDevelopment())
    ) {
      // Try fallback providers in order of preference (prioritize free Hugging Face)
      const hfApiKey = getEnvVar("HUGGINGFACE_API_KEY");
      if (hfApiKey) {
        console.warn(
          "Ollama not available in production, falling back to Hugging Face (FREE)",
        );
        this.baseURL = "https://router.huggingface.co/hf-inference";
        this.apiKey = hfApiKey;
        this.provider = "huggingface";
        this.model =
          getEnvVar("EMBEDDING_MODEL") ||
          "sentence-transformers/all-mpnet-base-v2"; // 768 dimensions
      } else {
        const googleApiKey = getEnvVar("GOOGLE_API_KEY");
        if (googleApiKey) {
          console.warn(
            "Ollama not available in production, falling back to Google Gemini",
          );
          this.baseURL = "https://generativelanguage.googleapis.com/v1beta";
          this.apiKey = googleApiKey.replace(/^Bearer\s+/i, "").trim();
          this.provider = "google";
          this.model = getEnvVar("EMBEDDING_MODEL") || "models/text-embedding-004"; // 768 dimensions
        } else {
          throw new Error(
            "Ollama is not available in production. Please set HUGGINGFACE_API_KEY or GOOGLE_API_KEY.",
          );
        }
      }
    }

    // Validate API key for providers that require it
    if (this.provider !== "ollama" && !this.apiKey) {
      throw new Error(
        `EMBEDDING_API_KEY or ${this.provider.toUpperCase()}_API_KEY is required for ${this.provider} provider`,
      );
    }

    // Initialize Hugging Face client if using HF
    if (this.provider === "huggingface" || this.provider === "hf") {
      this.hfClient = new HfInference(this.apiKey);
    }

    // For Google and other providers, we need custom client setup
    if (this.provider === "google") {
      // Google uses custom fetch implementation
      this.client = new OpenAI({
        apiKey: this.apiKey,
        baseURL: this.baseURL,
      });
    } else if (this.provider !== "huggingface" && this.provider !== "hf") {
      // OpenAI-compatible providers
      this.client = new OpenAI({
        apiKey: this.apiKey,
        baseURL: this.baseURL,
      });
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    // Hugging Face Inference API (using official package)
    // See: https://huggingface.co/docs/huggingface.js/inference/README
    if (this.provider === "huggingface" || this.provider === "hf") {
      if (!this.hfClient) {
        throw new Error("Hugging Face client not initialized");
      }

      const output = await this.hfClient.featureExtraction({
        model: this.model,
        inputs: text,
      });

      // featureExtraction returns number[] for single input, or number[][] for batch
      // Based on test: sentence-transformers/all-mpnet-base-v2 returns Array<number> (768 dimensions)
      if (Array.isArray(output)) {
        // Check if it's a nested array (batch) or flat array (single)
        if (output.length > 0 && Array.isArray(output[0])) {
          // Batch input returned - take first embedding
          return output[0] as number[];
        }
        // Single input - return as-is
        return output as number[];
      }

      // Fallback: convert to array if it's a typed array
      if (typeof output === "object" && output !== null && "length" in output) {
        return Array.from(output as any) as number[];
      }

      throw new Error(
        `Unexpected Hugging Face response format: ${typeof output}. Expected Array<number>.`,
      );
    }

    // Google Gemini Embeddings API
    if (this.provider === "google" || this.provider === "gemini") {
      // Google's embedding API endpoint format
      // text-embedding-004 produces 768 dimensions (compatible with nomic-embed-text)
      const modelName = this.model.replace(/^models\//, ""); // Remove "models/" prefix if present
      const endpoint = `${this.baseURL}/models/${modelName}:embedContent?key=${this.apiKey}`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: {
            parts: [{ text: text }],
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Google API error (${response.status}): ${errorText}`);
        throw new Error(
          `Google API error: ${response.statusText} (${response.status})`,
        );
      }

      const data = await response.json();
      return data.embedding?.values || data.embedding || [];
    }

    // OpenAI-compatible providers (Ollama, DeepSeek, etc.)
    if (!this.client) {
      throw new Error("Client not initialized for provider: " + this.provider);
    }

    const requestParams: any = {
      model: this.model,
      input: text,
    };

    const response = await this.client.embeddings.create(requestParams);
    return response.data[0].embedding;
  }

  async batchEmbeddings(texts: string[]): Promise<number[][]> {
    // Hugging Face Inference API (using official package)
    if (this.provider === "huggingface" || this.provider === "hf") {
      if (!this.hfClient) {
        throw new Error("Hugging Face client not initialized");
      }

      const output = await this.hfClient.featureExtraction({
        model: this.model,
        inputs: texts,
      });

      // featureExtraction returns number[][] for batch input
      // Based on test and documentation: batch inputs return array of arrays
      if (Array.isArray(output)) {
        // Check if it's a nested array (batch) or flat array
        if (output.length > 0 && Array.isArray(output[0])) {
          // Batch input - return as number[][]
          return output as number[][];
        }
        // Single array returned (unexpected for batch, but handle it)
        return [output as number[]];
      }

      // Fallback: convert typed array or object
      if (typeof output === "object" && output !== null && "length" in output) {
        const outputAny = output as any;
        return [Array.from(outputAny) as number[]];
      }

      throw new Error(
        `Unexpected Hugging Face batch response format: ${typeof output}. Expected number[][].`,
      );
    }

    // Google Gemini Embeddings API (batch)
    if (this.provider === "google" || this.provider === "gemini") {
      const requests = texts.map((text) => ({
        model: this.model,
        content: {
          parts: [{ text: text }],
        },
      }));

      const response = await fetch(
        `${this.baseURL}/models/${this.model}:batchEmbedContents?key=${this.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requests: requests,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Google API error: ${response.statusText}`);
      }

      const data = await response.json();
      return (
        data.embeddings?.map((emb: any) => emb.values || emb.embedding || []) ||
        []
      );
    }

    // OpenAI-compatible providers
    if (!this.client) {
      throw new Error("Client not initialized for provider: " + this.provider);
    }

    const requestParams: any = {
      model: this.model,
      input: texts,
    };

    const response = await this.client.embeddings.create(requestParams);
    return response.data.map((item) => item.embedding);
  }
}

// Lazy-loaded embedding provider to avoid initialization errors during build
let _embeddingProvider: EmbeddingProvider | null = null;

export function getEmbeddingProvider(): EmbeddingProvider {
  if (!_embeddingProvider) {
    _embeddingProvider = new EmbeddingProvider();
  }
  return _embeddingProvider;
}

// For backward compatibility, export a getter
export const embeddingProvider = {
  get generateEmbedding() {
    return getEmbeddingProvider().generateEmbedding.bind(
      getEmbeddingProvider(),
    );
  },
  get batchEmbeddings() {
    return getEmbeddingProvider().batchEmbeddings.bind(getEmbeddingProvider());
  },
};
