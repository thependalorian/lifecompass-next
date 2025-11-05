// lib/agent/tools.ts

import { neon } from "@neondatabase/serverless";
import { embeddingProvider } from "./providers";
import { ChunkResult, GraphSearchResult } from "./models";
import { runGraphQuery } from "@/lib/graph/neo4j";
import {
  getCustomerByNumber,
  getAdvisorByNumber,
  getCustomerPolicies,
  getCustomerClaims,
  getCustomerInteractions,
  getAdvisorTasks,
  getAdvisorClients,
  getAllDocuments,
} from "@/lib/db/neon";

const sql = neon(process.env.DATABASE_URL!);

// Tool input interfaces
export interface VectorSearchInput {
  query: string;
  limit?: number;
}

export interface GraphSearchInput {
  query: string;
}

export interface HybridSearchInput {
  query: string;
  limit?: number;
  textWeight?: number;
}

export interface DocumentInput {
  documentId: string;
}

export interface EntityRelationshipInput {
  entityName: string;
  depth?: number;
}

// Vector Search Tool
export async function vectorSearchTool(
  input: VectorSearchInput,
): Promise<ChunkResult[]> {
  try {
    const { query, limit = 10 } = input;

    // Generate embedding
    const embedding = await embeddingProvider.generateEmbedding(query);
    const embeddingStr = "[" + embedding.join(",") + "]";

    // Vector similarity search
    const results = await sql`
      SELECT
        c.id::text as chunk_id,
        c.document_id::text,
        c.content,
        d.title as document_title,
        d.source as document_source,
        c.metadata,
        1 - (c.embedding <=> ${embeddingStr}::vector) AS similarity
      FROM chunks c
      JOIN documents d ON c.document_id = d.id
      WHERE 1 - (c.embedding <=> ${embeddingStr}::vector) > 0.7
      ORDER BY c.embedding <=> ${embeddingStr}::vector
      LIMIT ${limit}
    `;

    return results.map((r) => ({
      chunkId: r.chunk_id,
      documentId: r.document_id,
      content: r.content,
      score: Number(r.similarity),
      metadata: r.metadata as Record<string, any>,
      documentTitle: r.document_title,
      documentSource: r.document_source,
    }));
  } catch (error) {
    console.error("Vector search failed:", error);
    return [];
  }
}

// Hybrid Search Tool
export async function hybridSearchTool(
  input: HybridSearchInput,
): Promise<ChunkResult[]> {
  try {
    const { query, limit = 10, textWeight = 0.3 } = input;

    // Generate embedding
    const embedding = await embeddingProvider.generateEmbedding(query);
    const embeddingStr = "[" + embedding.join(",") + "]";

    const results = await sql`
      WITH vector_search AS (
        SELECT
          c.id,
          c.content,
          c.document_id,
          c.metadata,
          d.title as document_title,
          d.source as document_source,
          1 - (c.embedding <=> ${embeddingStr}::vector) AS vector_score
        FROM chunks c
        JOIN documents d ON c.document_id = d.id
        ORDER BY c.embedding <=> ${embeddingStr}::vector
        LIMIT ${limit * 2}
      ),
      text_search AS (
        SELECT
          c.id,
          c.content,
          c.document_id,
          c.metadata,
          d.title as document_title,
          d.source as document_source,
          ts_rank(
            to_tsvector('english', c.content),
            plainto_tsquery('english', ${query})
          ) AS text_score
        FROM chunks c
        JOIN documents d ON c.document_id = d.id
        WHERE to_tsvector('english', c.content) @@ plainto_tsquery('english', ${query})
        ORDER BY text_score DESC
        LIMIT ${limit * 2}
      )
      SELECT
        COALESCE(v.id, t.id)::text AS chunk_id,
        COALESCE(v.document_id, t.document_id)::text AS document_id,
        COALESCE(v.content, t.content) AS content,
        COALESCE(v.document_title, t.document_title) AS document_title,
        COALESCE(v.document_source, t.document_source) AS document_source,
        COALESCE(v.metadata, t.metadata) AS metadata,
        (COALESCE(v.vector_score, 0) * ${1 - textWeight} +
         COALESCE(t.text_score, 0) * ${textWeight}) AS combined_score
      FROM vector_search v
      FULL OUTER JOIN text_search t ON v.id = t.id
      ORDER BY combined_score DESC
      LIMIT ${limit}
    `;

    return results.map((r) => ({
      chunkId: r.chunk_id,
      documentId: r.document_id,
      content: r.content,
      score: Number(r.combined_score),
      metadata: r.metadata as Record<string, any>,
      documentTitle: r.document_title,
      documentSource: r.document_source,
    }));
  } catch (error) {
    console.error("Hybrid search failed:", error);
    return [];
  }
}

// Graph Search Tool
export async function graphSearchTool(
  input: GraphSearchInput,
): Promise<GraphSearchResult[]> {
  try {
    const { query } = input;

    // Neo4j search query (adapt based on your graph schema)
    const cypherQuery = `
      MATCH (n)
      WHERE n.name CONTAINS $query OR n.description CONTAINS $query
      RETURN n.fact as fact,
             n.uuid as uuid,
             n.valid_at as validAt,
             n.invalid_at as invalidAt
      LIMIT 10
    `;

    const results = await runGraphQuery(cypherQuery, { query });

    return results.map((r: any) => ({
      fact: r.fact,
      uuid: r.uuid,
      validAt: r.validAt,
      invalidAt: r.invalidAt,
      sourceNodeUuid: r.uuid,
    }));
  } catch (error) {
    console.error("Graph search failed:", error);
    return [];
  }
}

// Get Document Tool
export async function getDocumentTool(
  input: DocumentInput,
): Promise<any | null> {
  try {
    const { documentId } = input;

    const [document] = await sql`
      SELECT
        id::text,
        title,
        source,
        content,
        metadata,
        created_at,
        updated_at
      FROM documents
      WHERE id = ${documentId}::uuid
    `;

    if (!document) return null;

    // Get chunks
    const chunks = await sql`
      SELECT
        id::text as chunk_id,
        content,
        chunk_index,
        metadata
      FROM chunks
      WHERE document_id = ${documentId}::uuid
      ORDER BY chunk_index
    `;

    return {
      ...document,
      chunks,
    };
  } catch (error) {
    console.error("Document retrieval failed:", error);
    return null;
  }
}

// Get Entity Relationships Tool
export async function getEntityRelationshipsTool(
  input: EntityRelationshipInput,
): Promise<any> {
  const { entityName, depth = 2 } = input;

  try {
    const cypherQuery = `
      MATCH path = (e:Entity {name: $entityName})-[*1..${depth}]-(related)
      RETURN e, related, relationships(path) as rels
      LIMIT 50
    `;

    const results = await runGraphQuery(cypherQuery, { entityName });

    return {
      centralEntity: entityName,
      relatedEntities: results,
      depth,
    };
  } catch (error) {
    console.error("Entity relationship query failed:", error);
    return {
      centralEntity: entityName,
      relatedEntities: [],
      error: String(error),
    };
  }
}

// List Documents Tool (RAG documents - for knowledge base)
export async function listDocumentsTool(limit = 20, offset = 0) {
  try {
    const documents = await sql`
      SELECT
        d.id::text,
        d.title,
        d.source,
        d.metadata,
        d.created_at,
        d.updated_at,
        COUNT(c.id) AS chunk_count
      FROM documents d
      LEFT JOIN chunks c ON d.id = c.document_id
      GROUP BY d.id, d.title, d.source, d.metadata, d.created_at, d.updated_at
      ORDER BY d.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    return documents;
  } catch (error) {
    console.error("Document listing failed:", error);
    return [];
  }
}

// ============================================================================
// CRM Data Access Tools
// ============================================================================
// Note: CRM functions are imported at the top of the file

// Tool input interfaces
export interface CustomerProfileInput {
  customerNumber: string;
}

export interface CustomerPoliciesInput {
  customerNumber: string;
}

export interface CustomerClaimsInput {
  customerNumber: string;
}

export interface CustomerInteractionsInput {
  customerNumber: string;
  limit?: number;
}

export interface AdvisorProfileInput {
  advisorNumber: string;
}

export interface AdvisorTasksInput {
  advisorNumber: string;
  status?: "open" | "completed" | "cancelled";
  priority?: "high" | "medium" | "low";
}

export interface ListDocumentsInput {
  category?: string;
  documentType?: string;
}

export interface SearchDocumentsInput {
  query: string;
  category?: string;
}

// Get Customer Profile Tool
export async function getCustomerProfileTool(
  input: CustomerProfileInput
): Promise<any> {
  try {
    const customer = await getCustomerByNumber(input.customerNumber);
    if (!customer) {
      return { error: `Customer ${input.customerNumber} not found` };
    }

    const policies = await getCustomerPolicies(customer.id);
    const claims = await getCustomerClaims(customer.id);
    const interactions = await getCustomerInteractions(customer.id, 5);

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
    console.error("Get customer profile failed:", error);
    return { error: "Failed to retrieve customer profile" };
  }
}

// Get Customer Policies Tool
export async function getCustomerPoliciesTool(
  input: CustomerPoliciesInput
): Promise<any[]> {
  try {
    const customer = await getCustomerByNumber(input.customerNumber);
    if (!customer) {
      return [];
    }

    return await getCustomerPolicies(customer.id);
  } catch (error) {
    console.error("Get customer policies failed:", error);
    return [];
  }
}

// Get Customer Claims Tool
export async function getCustomerClaimsTool(
  input: CustomerClaimsInput
): Promise<any[]> {
  try {
    const customer = await getCustomerByNumber(input.customerNumber);
    if (!customer) {
      return [];
    }

    return await getCustomerClaims(customer.id);
  } catch (error) {
    console.error("Get customer claims failed:", error);
    return [];
  }
}

// Get Customer Interactions Tool
export async function getCustomerInteractionsTool(
  input: CustomerInteractionsInput
): Promise<any[]> {
  try {
    const customer = await getCustomerByNumber(input.customerNumber);
    if (!customer) {
      return [];
    }

    return await getCustomerInteractions(customer.id, input.limit || 10);
  } catch (error) {
    console.error("Get customer interactions failed:", error);
    return [];
  }
}

// Get Advisor Profile Tool
export async function getAdvisorProfileTool(
  input: AdvisorProfileInput
): Promise<any> {
  try {
    const advisor = await getAdvisorByNumber(input.advisorNumber);
    if (!advisor) {
      return { error: `Advisor ${input.advisorNumber} not found` };
    }

    const clients = await getAdvisorClients(advisor.id);
    const tasks = await getAdvisorTasks(advisor.id, "open");

    return {
      advisor,
      clientCount: clients.length,
      openTaskCount: tasks.length,
      clients: clients.slice(0, 10), // Limit to first 10
      recentTasks: tasks.slice(0, 5), // Limit to first 5
    };
  } catch (error) {
    console.error("Get advisor profile failed:", error);
    return { error: "Failed to retrieve advisor profile" };
  }
}

// Get Advisor Tasks Tool
export async function getAdvisorTasksTool(
  input: AdvisorTasksInput
): Promise<any[]> {
  try {
    const advisor = await getAdvisorByNumber(input.advisorNumber);
    if (!advisor) {
      return [];
    }

    return await getAdvisorTasks(
      advisor.id,
      input.status,
      input.priority
    );
  } catch (error) {
    console.error("Get advisor tasks failed:", error);
    return [];
  }
}

// List Available Documents Tool (PDF documents)
export async function listAvailableDocumentsTool(
  input: ListDocumentsInput
): Promise<any[]> {
  try {
    const documents = await getAllDocuments(input.category, input.documentType);

    return documents.map((doc: any) => ({
      documentNumber: doc.document_number,
      title: doc.title,
      category: doc.category,
      documentType: doc.document_type,
      description: doc.description || "",
      downloadUrl: `/api/documents/${doc.document_number}/download`,
      viewUrl: `/api/documents/${doc.document_number}/view`,
    }));
  } catch (error) {
    console.error("List documents failed:", error);
    return [];
  }
}

// Search Documents Tool (PDF documents)
export async function searchDocumentsTool(
  input: SearchDocumentsInput
): Promise<any[]> {
  try {
    // Get all documents and filter by query
    const allDocs = await getAllDocuments(input.category);
    
    const queryLower = input.query.toLowerCase();
    const filtered = allDocs.filter((doc: any) => {
      const titleMatch = doc.title?.toLowerCase().includes(queryLower);
      const descMatch = doc.description?.toLowerCase().includes(queryLower);
      return titleMatch || descMatch;
    });

    return filtered.map((doc: any) => ({
      documentNumber: doc.document_number,
      title: doc.title,
      category: doc.category,
      documentType: doc.document_type,
      description: doc.description || "",
      downloadUrl: `/api/documents/${doc.document_number}/download`,
    }));
  } catch (error) {
    console.error("Search documents failed:", error);
    return [];
  }
}

// ============================================================================
// Calculator Tool
// ============================================================================

export interface CalculatorInput {
  expression: string;
  calculationType?: "basic" | "financial" | "premium" | "return" | "coverage";
  variables?: Record<string, number>;
}

// Calculator Tool for financial calculations
export async function calculatorTool(
  input: CalculatorInput
): Promise<any> {
  try {
    const { expression, calculationType = "basic", variables = {} } = input;

    // Replace variables in expression (e.g., "premium * 12" with variables: { premium: 100 })
    let processedExpression = expression;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\b${key}\\b`, "g");
      processedExpression = processedExpression.replace(regex, String(value));
    }

    // Remove any non-math characters for safety (allow numbers, operators, parentheses, spaces, decimal points)
    const sanitized = processedExpression.replace(/[^0-9+\-*/().\s]/g, "");

    let result: number;
    let formula: string;

    if (calculationType === "financial" || calculationType === "premium") {
      // Financial calculations
      result = evaluateFinancialExpression(sanitized, variables);
      formula = processedExpression;
    } else if (calculationType === "return") {
      // Investment return calculations
      result = calculateReturn(sanitized, variables);
      formula = processedExpression;
    } else if (calculationType === "coverage") {
      // Coverage calculations
      result = calculateCoverage(sanitized, variables);
      formula = processedExpression;
    } else {
      // Basic math evaluation (safely)
      result = evaluateBasicMath(sanitized);
      formula = processedExpression;
    }

    return {
      result,
      formula,
      expression: processedExpression,
      calculationType,
      variables,
    };
  } catch (error) {
    console.error("Calculator tool failed:", error);
    return {
      error: "Failed to calculate",
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Safe basic math evaluation
function evaluateBasicMath(expression: string): number {
  try {
    // Use Function constructor for safe evaluation (only allows math operations)
    // This is safer than eval() but still requires careful validation
    const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, "");
    
    // Validate expression contains only safe characters
    if (!/^[0-9+\-*/().\s]+$/.test(sanitized)) {
      throw new Error("Invalid expression");
    }

    // Use Function for evaluation (more secure than eval)
    const func = new Function("return " + sanitized);
    const result = func();
    
    if (typeof result !== "number" || !isFinite(result)) {
      throw new Error("Invalid calculation result");
    }
    
    return result;
  } catch (error) {
    throw new Error(`Calculation error: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

// Financial calculations (premiums, interest, etc.)
function evaluateFinancialExpression(expression: string, variables: Record<string, number>): number {
  // For financial calculations, we can implement specific formulas
  // For now, fall back to basic math evaluation
  return evaluateBasicMath(expression);
}

// Investment return calculation
function calculateReturn(expression: string, variables: Record<string, number>): number {
  // Simple return calculation: (current_value - initial_value) / initial_value * 100
  if (variables.currentValue && variables.initialValue) {
    return ((variables.currentValue - variables.initialValue) / variables.initialValue) * 100;
  }
  return evaluateBasicMath(expression);
}

// Coverage calculation
function calculateCoverage(expression: string, variables: Record<string, number>): number {
  // Coverage calculations (e.g., coverage amount based on income)
  if (variables.monthlyIncome && variables.coverageMultiplier) {
    return variables.monthlyIncome * variables.coverageMultiplier;
  }
  return evaluateBasicMath(expression);
}

// Helper function to extract numbers from text
export function extractCalculationFromText(text: string): {
  hasCalculation: boolean;
  expression?: string;
  calculationType?: "basic" | "financial" | "premium" | "return" | "coverage";
  variables?: Record<string, number>;
} {
  const textLower = text.toLowerCase();

  // Check for calculation keywords
  const hasCalculate = /calculate|compute|work out|what is|how much/i.test(text);
  const hasMath = /[\d+\-*/().]+/.test(text);
  
  if (!hasCalculate && !hasMath) {
    return { hasCalculation: false };
  }

  // Extract calculation type
  let calculationType: "basic" | "financial" | "premium" | "return" | "coverage" = "basic";
  
  if (/premium|monthly payment|payment/i.test(textLower)) {
    calculationType = "premium";
  } else if (/return|interest|yield|profit/i.test(textLower)) {
    calculationType = "return";
  } else if (/coverage|benefit|sum assured/i.test(textLower)) {
    calculationType = "coverage";
  } else if (/financial|investment|loan|mortgage/i.test(textLower)) {
    calculationType = "financial";
  }

  // Extract numbers and basic math expressions
  const mathPattern = /[\d+\-*/().\s]+/g;
  const matches = text.match(mathPattern);
  
  if (matches && matches.length > 0) {
    // Find the most complete math expression
    const expression = matches
      .filter((m) => /[\d+\-*/().]/.test(m))
      .sort((a, b) => b.length - a.length)[0];
    
    if (expression) {
      return {
        hasCalculation: true,
        expression: expression.trim(),
        calculationType,
      };
    }
  }

  // Extract variables if mentioned (e.g., "premium of 100", "income of 5000")
  const variables: Record<string, number> = {};
  const premiumMatch = text.match(/premium\s+(?:of|is|:)?\s*\$?([\d,]+\.?\d*)/i);
  if (premiumMatch) {
    variables.premium = parseFloat(premiumMatch[1].replace(/,/g, ""));
  }

  const incomeMatch = text.match(/(?:monthly\s+)?income\s+(?:of|is|:)?\s*\$?([\d,]+\.?\d*)/i);
  if (incomeMatch) {
    variables.monthlyIncome = parseFloat(incomeMatch[1].replace(/,/g, ""));
  }

  const coverageMatch = text.match(/coverage\s+(?:of|is|:)?\s*\$?([\d,]+\.?\d*)/i);
  if (coverageMatch) {
    variables.coverageAmount = parseFloat(coverageMatch[1].replace(/,/g, ""));
  }

  return {
    hasCalculation: hasCalculate || hasMath,
    calculationType,
    variables: Object.keys(variables).length > 0 ? variables : undefined,
  };
}
