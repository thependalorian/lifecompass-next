// lib/types/persona.ts
// Type definitions for persona and session metadata
// Purpose: Ensure type safety for persona-related data structures

/**
 * Persona metadata structure used in session metadata and ChatRequest
 */
export interface PersonaMetadata {
  selectedCustomerPersona?: string;
  selectedAdvisorPersona?: string;
  userType?: "customer" | "advisor";
  customerId?: string;
  advisorId?: string;
  customerNumber?: string;
  advisorNumber?: string;
}

/**
 * Extended ChatRequest metadata that includes persona information
 */
export interface ChatRequestMetadata extends PersonaMetadata {
  [key: string]: any; // Allow additional metadata fields
}

/**
 * Session metadata structure stored in database
 */
export interface SessionMetadata extends PersonaMetadata {
  [key: string]: unknown; // Allow additional metadata fields
}

