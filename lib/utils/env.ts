// lib/utils/env.ts
// Centralized environment variable validation using Zod
// Fails fast on missing critical env vars to prevent runtime errors

import { z } from "zod";

/**
 * Environment variable schema using Zod
 * Validates all environment variables at startup
 */
const envSchema = z.object({
  // Database Configuration (Required)
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required")
    .refine(
      (val) => {
        if (!val) return false;
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: "DATABASE_URL must be a valid URL" },
    ),

  // Neo4j Configuration (Required)
  NEO4J_URI: z
    .string()
    .min(1, "NEO4J_URI is required")
    .refine(
      (val) => {
        if (!val) return false;
        try {
          new URL(val.replace(/^neo4j\+s?:\/\//, "https://"));
          return true;
        } catch {
          return false;
        }
      },
      { message: "NEO4J_URI must be a valid URL" },
    ),
  NEO4J_USERNAME: z.string().optional(),
  NEO4J_USER: z.string().optional(), // Alias for NEO4J_USERNAME
  NEO4J_PASSWORD: z
    .string()
    .min(1, "NEO4J_PASSWORD is required"),

  // LLM Provider Configuration (Required)
  DEEPSEEK_API_KEY: z.string().optional(),
  LLM_API_KEY: z.string().optional(), // Fallback for DEEPSEEK_API_KEY
  DEEPSEEK_MODEL: z.string().optional(),
  LLM_CHOICE: z.string().optional(), // Fallback for DEEPSEEK_MODEL
  DEEPSEEK_BASE_URL: z.string().optional(), // URL validation happens in getEnvVar if provided
  LLM_BASE_URL: z.string().optional(), // Fallback for DEEPSEEK_BASE_URL

  // Groq API Configuration (Optional - for document processing)
  GROQ_API_KEY: z.string().optional(),

  // Embedding Provider Configuration (Optional - has fallbacks)
  EMBEDDING_PROVIDER: z
    .enum(["ollama", "huggingface", "hf", "google", "gemini", "deepseek"])
    .optional(),
  EMBEDDING_BASE_URL: z.string().optional(), // URL validation happens in getEnvVar
  EMBEDDING_API_KEY: z.string().optional(),
  EMBEDDING_MODEL: z.string().optional(),
  HUGGINGFACE_API_KEY: z.string().optional(),
  GOOGLE_API_KEY: z.string().optional(),

  // Application Configuration (Optional)
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  VERCEL: z.string().optional(), // Vercel sets this automatically
  DEBUG_LLM: z.string().optional(), // Enable LLM debug logging
});

/**
 * Validated environment variables
 * Access via env.DATABASE_URL, env.NEO4J_URI, etc.
 */
export type Env = z.infer<typeof envSchema>;

let validatedEnv: Env | null = null;

/**
 * Get validated environment variables
 * Validates on first access and caches the result
 * @throws Error if validation fails
 */
export function getEnv(): Env {
  if (validatedEnv) {
    return validatedEnv;
  }

  try {
    // Helper to strip quotes from env values (some .env files have quotes)
    const stripQuotes = (val: string | undefined): string | undefined => {
      if (!val) return val;
      return val.replace(/^['"]|['"]$/g, "").trim();
    };

    // Get all env vars directly from process.env
    // Next.js automatically loads .env files, so process.env should be populated
    // Strip quotes if present (handles cases like DATABASE_URL='...')
    const rawEnv = {
      DATABASE_URL: stripQuotes(process.env.DATABASE_URL),
      NEO4J_URI: stripQuotes(process.env.NEO4J_URI),
      NEO4J_USERNAME: stripQuotes(process.env.NEO4J_USERNAME),
      NEO4J_USER: stripQuotes(process.env.NEO4J_USER),
      NEO4J_PASSWORD: stripQuotes(process.env.NEO4J_PASSWORD),
      DEEPSEEK_API_KEY: stripQuotes(process.env.DEEPSEEK_API_KEY),
      LLM_API_KEY: stripQuotes(process.env.LLM_API_KEY),
      DEEPSEEK_MODEL: stripQuotes(process.env.DEEPSEEK_MODEL),
      LLM_CHOICE: stripQuotes(process.env.LLM_CHOICE),
      DEEPSEEK_BASE_URL: stripQuotes(process.env.DEEPSEEK_BASE_URL),
      LLM_BASE_URL: stripQuotes(process.env.LLM_BASE_URL),
      GROQ_API_KEY: stripQuotes(process.env.GROQ_API_KEY),
      EMBEDDING_PROVIDER: stripQuotes(process.env.EMBEDDING_PROVIDER),
      EMBEDDING_BASE_URL: stripQuotes(process.env.EMBEDDING_BASE_URL),
      EMBEDDING_API_KEY: stripQuotes(process.env.EMBEDDING_API_KEY),
      EMBEDDING_MODEL: stripQuotes(process.env.EMBEDDING_MODEL),
      HUGGINGFACE_API_KEY: stripQuotes(process.env.HUGGINGFACE_API_KEY),
      GOOGLE_API_KEY: stripQuotes(process.env.GOOGLE_API_KEY),
      NODE_ENV: (stripQuotes(process.env.NODE_ENV) || "development") as
        | "development"
        | "production"
        | "test",
      VERCEL: stripQuotes(process.env.VERCEL),
      DEBUG_LLM: stripQuotes(process.env.DEBUG_LLM),
    };

    // Validate with Zod
    validatedEnv = envSchema.parse(rawEnv);

    // Additional validation: Ensure at least one LLM API key is provided
    if (!validatedEnv.DEEPSEEK_API_KEY && !validatedEnv.LLM_API_KEY) {
      throw new Error(
        "Either DEEPSEEK_API_KEY or LLM_API_KEY must be provided",
      );
    }

    return validatedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .filter((e) => e.code === "invalid_type" && e.received === "undefined")
        .map((e) => e.path.join("."));
      const invalidVars = error.errors
        .filter((e) => e.code !== "invalid_type")
        .map((e) => `${e.path.join(".")}: ${e.message}`);

      let errorMessage = "Environment variable validation failed:\n\n";

      if (missingVars.length > 0) {
        errorMessage += `Missing required variables:\n${missingVars.map((v) => `  - ${v}`).join("\n")}\n\n`;
      }

      if (invalidVars.length > 0) {
        errorMessage += `Invalid variables:\n${invalidVars.map((v) => `  - ${v}`).join("\n")}\n\n`;
      }

      errorMessage +=
        "Please check your .env file or environment configuration.";

      throw new Error(errorMessage);
    }
    throw error;
  }
}

/**
 * Get a specific environment variable with validation
 * @param key - Environment variable key
 * @returns Validated value
 * @throws Error if variable is missing or invalid
 */
export function getEnvVar<K extends keyof Env>(key: K): Env[K] {
  const env = getEnv();
  return env[key];
}

/**
 * Get a specific environment variable with a fallback value
 * @param key - Environment variable key
 * @param fallback - Fallback value if env var is undefined
 * @returns Validated value or fallback
 */
export function getEnvVarWithFallback<K extends keyof Env>(
  key: K,
  fallback: NonNullable<Env[K]>,
): NonNullable<Env[K]> {
  const env = getEnv();
  return (env[key] ?? fallback) as NonNullable<Env[K]>;
}

/**
 * Check if we're in production
 */
export function isProduction(): boolean {
  return getEnvVar("NODE_ENV") === "production";
}

/**
 * Check if we're in development
 */
export function isDevelopment(): boolean {
  return getEnvVar("NODE_ENV") === "development";
}

/**
 * Check if running on Vercel
 */
export function isVercel(): boolean {
  return !!getEnvVar("VERCEL");
}

/**
 * Get validated environment variables (lazy accessor)
 * Use this instead of exporting a const to ensure .env is loaded first
 */
export function env(): Env {
  return getEnv();
}

