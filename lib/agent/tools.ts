// lib/agent/tools.ts
// Tool functions for agent use - wraps database and search functions
// Purpose: Provide consistent interface for all agent tools

import type { ChunkResult, GraphSearchResult } from "./models";
import {
  getCustomerByNumber,
  getAdvisorByNumber,
  getAdvisorById,
  getAllAdvisors,
  getCustomerPolicies,
  getCustomerClaims,
  getCustomerInteractions,
  getAdvisorTasks,
  getAdvisorClients,
  getAllDocuments,
  getSqlClient,
} from "@/lib/db/neon";
import { SemanticGraphSearch } from "@/lib/graph/semantic-search";
import { getEmbeddingProvider } from "./providers";

// ============================================================================
// Search Tools
// ============================================================================

/**
 * Vector search tool - searches using embeddings only
 */
export async function vectorSearchTool(params: {
  query: string;
  limit?: number;
}): Promise<ChunkResult[]> {
  try {
    const embeddingProvider = getEmbeddingProvider();
    const embedding = await embeddingProvider.generateEmbedding(params.query);
    const limit = params.limit || 10;

    // Convert embedding to PostgreSQL vector format: '[1.0,2.0,3.0]'
    const embeddingStr = "[" + embedding.join(",") + "]";

    const client = getSqlClient();
    const results = (await client`
      SELECT
        c.id::text as chunk_id,
        c.document_id::text as document_id,
        c.content,
        (1 - (c.embedding <=> ${embeddingStr}::vector))::double precision as similarity,
        c.metadata,
        d.title as document_title,
        d.source as document_source
      FROM chunks c
      JOIN documents d ON c.document_id = d.id
      WHERE c.embedding IS NOT NULL
      ORDER BY c.embedding <=> ${embeddingStr}::vector
      LIMIT ${limit}
    `) as Array<{
      chunk_id: string;
      document_id: string;
      content: string;
      similarity: number;
      metadata: any;
      document_title: string;
      document_source: string;
    }>;

    return results.map((r) => ({
      chunkId: r.chunk_id,
      documentId: r.document_id,
      content: r.content,
      score: r.similarity,
      metadata: r.metadata || {},
      documentTitle: r.document_title || "",
      documentSource: r.document_source || "",
    }));
  } catch (error) {
    console.error("[Tools] Vector search failed:", error);
    return [];
  }
}

/**
 * Hybrid search tool - combines vector and keyword search
 */
export async function hybridSearchTool(params: {
  query: string;
  limit?: number;
  textWeight?: number;
}): Promise<ChunkResult[]> {
  try {
    const embeddingProvider = getEmbeddingProvider();
    const embedding = await embeddingProvider.generateEmbedding(params.query);
    const limit = params.limit || 10;
    const textWeight = params.textWeight || 0.3;

    // Convert embedding to PostgreSQL vector format: '[1.0,2.0,3.0]'
    const embeddingStr = "[" + embedding.join(",") + "]";

    const client = getSqlClient();
    const results = (await client`
      SELECT * FROM hybrid_search(
        ${embeddingStr}::vector,
        ${params.query},
        ${limit},
        ${textWeight}
      )
    `) as Array<{
      chunk_id: string;
      document_id: string;
      content: string;
      combined_score: number;
      vector_similarity: number;
      text_similarity: number;
      metadata: any;
      document_title: string;
      document_source: string;
    }>;

    return results.map((r) => ({
      chunkId: r.chunk_id,
      documentId: r.document_id,
      content: r.content,
      score: r.combined_score,
      metadata: r.metadata || {},
      documentTitle: r.document_title || "",
      documentSource: r.document_source || "",
    }));
  } catch (error) {
    console.error("[Tools] Hybrid search failed:", error);
    return [];
  }
}

/**
 * Graph search tool - searches Neo4j knowledge graph
 */
export async function graphSearchTool(params: {
  query: string;
  limit?: number;
}): Promise<GraphSearchResult[]> {
  try {
    const search = new SemanticGraphSearch();
    // Ensure limit is always an absolute integer (Neo4j requires integer, not float)
    // Use Math.floor after parseInt to ensure true integer (handles edge cases)
    const limit = Math.floor(Math.abs(parseInt(String(params.limit || 10), 10)));
    const results = await search.search(params.query, limit);

    return results.map((r) => ({
      fact: r.fact,
      uuid: r.uuid,
      validAt: r.validAt || undefined,
      invalidAt: r.invalidAt || undefined,
      sourceNodeUuid: r.relationships?.[0]?.target,
    }));
  } catch (error) {
    console.error("[Tools] Graph search failed:", error);
    return [];
  }
}

/**
 * Get document tool - retrieves a specific document by ID
 */
export async function getDocumentTool(params: {
  documentId: string;
}): Promise<any> {
  try {
    const client = getSqlClient();
    const result = (await client`
      SELECT
        id::text,
        title,
        source,
        category,
        document_type,
        file_path,
        file_size,
        metadata,
        created_at
      FROM documents
      WHERE id = ${params.documentId}::uuid
    `) as Array<any>;

    return result[0] || null;
  } catch (error) {
    console.error("[Tools] Get document failed:", error);
    return null;
  }
}

/**
 * Get entity relationships tool - finds relationships for an entity
 */
export async function getEntityRelationshipsTool(params: {
  entityName: string;
  relationshipType?: string;
  depth?: number;
}): Promise<any[]> {
  try {
    const search = new SemanticGraphSearch();
    const results = await search.searchEntities(params.entityName);

    if (params.relationshipType) {
      return results.filter((r) =>
        r.relationships?.some((rel) => rel.type === params.relationshipType),
      );
    }

    return results;
  } catch (error) {
    console.error("[Tools] Get entity relationships failed:", error);
    return [];
  }
}

/**
 * List available documents tool
 */
export async function listAvailableDocumentsTool(params?: {
  limit?: number;
  category?: string;
  documentType?: string;
}): Promise<any[]> {
  try {
    const documents = await getAllDocuments(
      params?.category,
      params?.documentType,
    );
    return documents;
  } catch (error) {
    console.error("[Tools] List documents failed:", error);
    return [];
  }
}

/**
 * Search documents tool - searches document metadata
 */
export async function searchDocumentsTool(params: {
  query: string;
  limit?: number;
  category?: string;
}): Promise<any[]> {
  try {
    // Use hybrid search to find relevant documents
    const results = await hybridSearchTool({
      query: params.query,
      limit: params.limit || 10,
    });

    // Group by document and return unique documents
    const documentMap = new Map<string, any>();
    for (const result of results) {
      // Filter by category if provided
      if (params.category && result.metadata?.category !== params.category) {
        continue;
      }

      if (!documentMap.has(result.documentId)) {
        documentMap.set(result.documentId, {
          documentId: result.documentId,
          documentTitle: result.documentTitle,
          documentSource: result.documentSource,
          metadata: result.metadata,
        });
      }
    }

    return Array.from(documentMap.values());
  } catch (error) {
    console.error("[Tools] Search documents failed:", error);
    return [];
  }
}

// ============================================================================
// CRM Tools - Customer
// ============================================================================

/**
 * Get customer profile tool - retrieves complete customer profile with policies, claims, interactions
 */
export async function getCustomerProfileTool(params: {
  customerNumber: string;
}): Promise<any> {
  try {
    const customer = await getCustomerByNumber(params.customerNumber);
    if (!customer) {
      return { error: `Customer ${params.customerNumber} not found` };
    }

    const policies = await getCustomerPolicies(customer.id);
    const claims = await getCustomerClaims(customer.id);
    const interactions = await getCustomerInteractions(customer.id, 10);

    return {
      customer,
      policies,
      claims,
      interactions,
      policyCount: policies.length,
      claimCount: claims.length,
      interactionCount: interactions.length,
    };
  } catch (error) {
    console.error("[Tools] Get customer profile failed:", error);
    return { error: "Failed to retrieve customer profile" };
  }
}

/**
 * Get customer policies tool
 */
export async function getCustomerPoliciesTool(params: {
  customerNumber: string;
}): Promise<any[]> {
  try {
    const customer = await getCustomerByNumber(params.customerNumber);
    if (!customer) {
      return [];
    }

    const policies = await getCustomerPolicies(customer.id);
    return policies;
  } catch (error) {
    console.error("[Tools] Get customer policies failed:", error);
    return [];
  }
}

/**
 * Get customer claims tool
 */
export async function getCustomerClaimsTool(params: {
  customerNumber: string;
}): Promise<any[]> {
  try {
    const customer = await getCustomerByNumber(params.customerNumber);
    if (!customer) {
      return [];
    }

    const claims = await getCustomerClaims(customer.id);
    return claims;
  } catch (error) {
    console.error("[Tools] Get customer claims failed:", error);
    return [];
  }
}

/**
 * Get customer interactions tool
 */
export async function getCustomerInteractionsTool(params: {
  customerNumber: string;
  limit?: number;
}): Promise<any[]> {
  try {
    const customer = await getCustomerByNumber(params.customerNumber);
    if (!customer) {
      return [];
    }

    const limit = params.limit || 10;
    const interactions = await getCustomerInteractions(customer.id, limit);
    return interactions;
  } catch (error) {
    console.error("[Tools] Get customer interactions failed:", error);
    return [];
  }
}

// ============================================================================
// CRM Tools - Advisor
// ============================================================================

/**
 * Get advisor profile tool
 */
export async function getAdvisorProfileTool(params: {
  advisorNumber: string;
}): Promise<any> {
  try {
    const advisor = await getAdvisorByNumber(params.advisorNumber);
    if (!advisor) {
      return { error: `Advisor ${params.advisorNumber} not found` };
    }

    const clients = await getAdvisorClients(advisor.id, 50);

    return {
      advisor,
      clients,
      clientCount: clients.length,
    };
  } catch (error) {
    console.error("[Tools] Get advisor profile failed:", error);
    return { error: "Failed to retrieve advisor profile" };
  }
}

/**
 * Get advisor tasks tool
 */
export async function getAdvisorTasksTool(params: {
  advisorNumber: string;
  status?: "open" | "completed" | "cancelled" | "in_progress";
  priority?: "high" | "medium" | "low" | "urgent";
}): Promise<any[]> {
  try {
    const advisor = await getAdvisorByNumber(params.advisorNumber);
    if (!advisor) {
      return [];
    }

    const tasks = await getAdvisorTasks(
      advisor.id,
      params.status,
      params.priority,
    );
    return tasks;
  } catch (error) {
    console.error("[Tools] Get advisor tasks failed:", error);
    return [];
  }
}

/**
 * Recommend advisors tool - finds advisors based on specialization and customer needs
 */
export async function recommendAdvisorsTool(params: {
  specialization?: string;
  customerSegment?: string;
  region?: string;
  limit?: number;
}): Promise<any[]> {
  try {
    const allAdvisors = await getAllAdvisors();
    let recommendations = [...allAdvisors];

    // Filter by specialization if provided
    if (params.specialization) {
      const specializationLower = params.specialization.toLowerCase();
      recommendations = recommendations.filter((advisor) => {
        if (!advisor.specialization) return false;
        return advisor.specialization
          .toLowerCase()
          .includes(specializationLower);
      });
    }

    // Filter by region if provided
    if (params.region) {
      const regionLower = params.region.toLowerCase();
      recommendations = recommendations.filter((advisor) => {
        if (!advisor.region) return false;
        return advisor.region.toLowerCase().includes(regionLower);
      });
    }

    // Sort by performance (satisfaction_score, then active_clients)
    recommendations.sort((a, b) => {
      const scoreA =
        (a.satisfaction_score ? Number(a.satisfaction_score) : 0) +
        (a.active_clients ? Number(a.active_clients) : 0) * 0.1;
      const scoreB =
        (b.satisfaction_score ? Number(b.satisfaction_score) : 0) +
        (b.active_clients ? Number(b.active_clients) : 0) * 0.1;
      return scoreB - scoreA;
    });

    // Limit results
    const limit = params.limit || 5;
    recommendations = recommendations.slice(0, limit);

    // Format response
    return recommendations.map((advisor) => ({
      advisor_number: advisor.advisor_number,
      name: `${advisor.first_name} ${advisor.last_name}`,
      specialization: advisor.specialization || "General",
      experience_years: advisor.experience_years || 0,
      region: advisor.region || "Not specified",
      branch: advisor.branch || "Not specified",
      phone: advisor.phone || "Not available",
      email: advisor.email || "Not available",
      active_clients: advisor.active_clients || 0,
      satisfaction_score: advisor.satisfaction_score || 0,
      performance_rating: advisor.performance_rating || "Not rated",
    }));
  } catch (error) {
    console.error("[Tools] Recommend advisors failed:", error);
    return [];
  }
}

// ============================================================================
// Calculator Tool
// ============================================================================

/**
 * Extract calculation from text
 */
export function extractCalculationFromText(text: string): {
  hasCalculation: boolean;
  expression?: string;
  calculationType?: string;
  variables?: Record<string, number>;
} {
  // Simple pattern matching for calculations
  const calcPattern = /(\d+(?:\.\d+)?)\s*([+\-*/])\s*(\d+(?:\.\d+)?)/;
  const match = text.match(calcPattern);

  if (match) {
    const [, num1, op, num2] = match;
    return {
      hasCalculation: true,
      expression: `${num1} ${op} ${num2}`,
      calculationType: "arithmetic",
      variables: {},
    };
  }

  // Check for "calculate" keyword with numbers
  const calculateMatch = text.match(
    /calculate|compute|work out|what is|how much/i,
  );
  if (calculateMatch && /\d/.test(text)) {
    // Extract numbers and operators
    const numbers = text.match(/\d+(?:\.\d+)?/g) || [];
    const operators = text.match(/[+\-*/]/g) || [];

    if (numbers.length >= 2) {
      return {
        hasCalculation: true,
        expression: `${numbers[0]} ${operators[0] || "+"} ${numbers[1]}`,
        calculationType: "arithmetic",
        variables: {},
      };
    }
  }

  return { hasCalculation: false };
}

/**
 * Calculator tool - performs calculations
 */
export async function calculatorTool(params: {
  expression: string;
  calculationType?: string;
  variables?: Record<string, number>;
}): Promise<any> {
  try {
    // Simple safe evaluation (only basic arithmetic)
    const sanitized = params.expression.replace(/[^0-9+\-*/().\s]/g, "");

    // Use Function constructor for safe evaluation (no eval)
    const result = Function(`"use strict"; return (${sanitized})`)();

    return {
      expression: params.expression,
      result,
      calculationType: params.calculationType || "arithmetic",
    };
  } catch (error) {
    console.error("[Tools] Calculator failed:", error);
    return {
      expression: params.expression,
      error: "Failed to calculate",
    };
  }
}
