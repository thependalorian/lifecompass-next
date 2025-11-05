// lib/agent/providers.ts

import OpenAI from "openai";

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
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL,
    });
    this.model = config.model;
    this.temperature = config.temperature ?? 0.7;
    this.maxTokens = config.maxTokens ?? 1000;
  }

  async chat(
    messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  ) {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: messages as any, // Type assertion to bypass strict typing
      temperature: this.temperature,
      max_tokens: this.maxTokens,
    });

    return response.choices[0].message.content || "";
  }

  async streamChat(
    messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  ) {
    const stream = await this.client.chat.completions.create({
      model: this.model,
      messages: messages as any, // Type assertion to bypass strict typing
      temperature: this.temperature,
      max_tokens: this.maxTokens,
      stream: true,
    });

    return stream;
  }
}

// Factory function
export function getDeepSeekProvider(): DeepSeekProvider {
  return new DeepSeekProvider({
    apiKey: process.env.DEEPSEEK_API_KEY!,
    baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1",
    model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
    temperature: 0.7,
    maxTokens: 1000,
  });
}

// Embedding provider (using OpenAI-compatible API)
export class EmbeddingProvider {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.EMBEDDING_API_KEY!,
      baseURL: process.env.EMBEDDING_BASE_URL || "https://api.openai.com/v1",
    });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.client.embeddings.create({
      model: process.env.EMBEDDING_MODEL || "text-embedding-3-small",
      input: text,
    });

    return response.data[0].embedding;
  }

  async batchEmbeddings(texts: string[]): Promise<number[][]> {
    const response = await this.client.embeddings.create({
      model: process.env.EMBEDDING_MODEL || "text-embedding-3-small",
      input: texts,
    });

    return response.data.map((item) => item.embedding);
  }
}

export const embeddingProvider = new EmbeddingProvider();
