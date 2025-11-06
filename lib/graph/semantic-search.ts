// lib/graph/semantic-search.ts
// Semantic graph search that mimics Graphiti's capabilities in TypeScript
// Uses embeddings + enhanced text matching + relationship traversal

import { runGraphQuery } from "./neo4j";
import { getEmbeddingProvider } from "../agent/providers";

export interface GraphSearchResult {
  fact: string;
  uuid: string;
  validAt: string | null;
  invalidAt: string | null;
  score: number;
  relationships?: Array<{
    type: string;
    target: string;
    targetFact?: string;
  }>;
}

export class SemanticGraphSearch {
  private embeddingProvider = getEmbeddingProvider();

  /**
   * Semantic graph search with three strategies:
   * 1. Enhanced text matching with relationship traversal (works immediately)
   * 2. Vector similarity using PostgreSQL embeddings (if available)
   * 3. Basic text matching (final fallback)
   */
  async search(query: string, limit: number = 10): Promise<GraphSearchResult[]> {
    try {
      // Step 1: Try enhanced text search with relationship traversal (most reliable)
      const textResults = await this.enhancedTextSearch(query, limit);
      
      if (textResults.length > 0) {
        console.log(`[Graph] Enhanced text search found ${textResults.length} results`);
        
        // Optionally enhance with vector similarity if we have embeddings
        // For now, return text results as they're most reliable
        return textResults;
      }

      // Step 2: Fallback to basic text search
      console.log("[Graph] Falling back to basic text search");
      return this.basicTextSearch(query, limit);
    } catch (error) {
      console.error("[Graph] Semantic search failed:", error);
      // Final fallback: basic text search without error
      return this.basicTextSearch(query, limit);
    }
  }

  /**
   * Enhanced text matching with relationship traversal
   * Better than basic CONTAINS - uses multiple properties + relationships
   * This works with the actual Graphiti schema (fact, uuid, valid_at, etc.)
   */
  private async enhancedTextSearch(query: string, limit: number): Promise<GraphSearchResult[]> {
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);

    const cypherQuery = `
      MATCH (n)
      WHERE 
        n.fact IS NOT NULL AND (
          toLower(n.fact) CONTAINS $query OR
          toLower(n.name) CONTAINS $query OR
          toLower(n.description) CONTAINS $query OR
          ANY(word IN $queryWords WHERE toLower(n.fact) CONTAINS word)
        )
      
      // Calculate simple text relevance score
      WITH n,
           CASE 
             WHEN toLower(n.fact) CONTAINS $query THEN 1.0
             WHEN toLower(n.name) CONTAINS $query THEN 0.9
             WHEN toLower(n.description) CONTAINS $query THEN 0.8
             ELSE 0.6
           END as score
      
      // Get related nodes for context (follow relationships)
      OPTIONAL MATCH (n)-[r]->(related)
      WHERE related.fact IS NOT NULL OR related.name IS NOT NULL
      
      WITH n, score,
           collect(DISTINCT {
             type: type(r),
             target: coalesce(related.name, related.fact, ''),
             targetFact: related.fact
           })[0..3] as relationships
      
      RETURN 
        n.fact as fact,
        n.uuid as uuid,
        n.valid_at as validAt,
        n.invalid_at as invalidAt,
        score,
        relationships
      ORDER BY score DESC
      LIMIT $limit
    `;

    try {
      const results = await runGraphQuery(cypherQuery, {
        query: queryLower,
        queryWords,
        limit,
      });

      return results.map((r: any) => ({
        fact: r.fact || "",
        uuid: r.uuid || "",
        validAt: r.validAt || null,
        invalidAt: r.invalidAt || null,
        score: r.score || 0,
        relationships: (r.relationships || []).filter((rel: any) => rel.target), // Filter empty relationships
      }));
    } catch (error) {
      console.error("[Graph] Enhanced text search failed:", error);
      return [];
    }
  }

  /**
   * Basic text search - simplest fallback
   * Works with Graphiti schema: fact, uuid, valid_at, invalid_at
   */
  private async basicTextSearch(query: string, limit: number): Promise<GraphSearchResult[]> {
    const cypherQuery = `
      MATCH (n)
      WHERE n.fact IS NOT NULL AND (
        n.fact CONTAINS $query OR 
        n.name CONTAINS $query OR 
        n.description CONTAINS $query
      )
      RETURN 
        n.fact as fact,
        n.uuid as uuid,
        n.valid_at as validAt,
        n.invalid_at as invalidAt,
        0.5 as score,
        [] as relationships
      LIMIT $limit
    `;

    try {
      const results = await runGraphQuery(cypherQuery, { query, limit });
      return results.map((r: any) => ({
        fact: r.fact || "",
        uuid: r.uuid || "",
        validAt: r.validAt || null,
        invalidAt: r.invalidAt || null,
        score: 0.5,
        relationships: [],
      }));
    } catch (error) {
      console.error("[Graph] Basic text search failed:", error);
      return [];
    }
  }

  /**
   * Vector similarity search using embeddings
   * This approach:
   * 1. Generates embedding for query
   * 2. Fetches facts from Neo4j
   * 3. Calculates similarity in memory (or uses PostgreSQL vector search)
   * 
   * Note: Graphiti doesn't store embeddings on Neo4j nodes, but we can:
   * - Use PostgreSQL embeddings if chunks are stored there
   * - Calculate similarity in memory after fetching facts
   */
  async vectorSearch(query: string, limit: number = 10): Promise<GraphSearchResult[]> {
    try {
      // Generate query embedding
      const queryEmbedding = await this.embeddingProvider.generateEmbedding(query);
      
      // Get all facts from Neo4j (we'll filter by similarity in memory)
      // For better performance, we could first do text search to narrow down
      const cypherQuery = `
        MATCH (n)
        WHERE n.fact IS NOT NULL
        RETURN 
          n.fact as fact,
          n.uuid as uuid,
          n.valid_at as validAt,
          n.invalid_at as invalidAt
        LIMIT 100
      `;

      const allFacts = await runGraphQuery(cypherQuery, {});
      
      if (allFacts.length === 0) {
        return [];
      }

      // For now, return text-based results as we don't have fact embeddings stored
      // Future: Could store fact embeddings in PostgreSQL and do vector similarity there
      console.warn("[Graph] Vector search not fully implemented - fact embeddings not stored in Neo4j");
      return this.enhancedTextSearch(query, limit);
      
    } catch (error) {
      console.error("[Graph] Vector search failed:", error);
      return [];
    }
  }

  /**
   * Entity-focused search - find entities and their relationships
   * Useful for questions like "What does Old Mutual offer?"
   * 
   * Note: Graphiti extracts entities automatically, but we need to query by entity labels
   * or by searching for entity names in facts
   */
  async searchEntities(
    entityName: string,
    limit: number = 5
  ): Promise<GraphSearchResult[]> {
    const queryLower = entityName.toLowerCase();
    
    // Graphiti creates entities, but we'll search facts that mention the entity
    const cypherQuery = `
      MATCH (n)
      WHERE 
        n.fact IS NOT NULL AND
        toLower(n.fact) CONTAINS $query
      
      // Get relationships to other nodes
      OPTIONAL MATCH (n)-[r]->(related)
      WHERE related.fact IS NOT NULL
      
      WITH n,
           collect({
             type: type(r),
             target: coalesce(related.name, related.fact, ''),
             targetFact: related.fact
           })[0..5] as relationships
      
      RETURN 
        n.fact as fact,
        n.uuid as uuid,
        n.valid_at as validAt,
        n.invalid_at as invalidAt,
        1.0 as score,
        relationships
      LIMIT $limit
    `;

    try {
      const results = await runGraphQuery(cypherQuery, {
        query: queryLower,
        limit,
      });

      return results.map((r: any) => ({
        fact: r.fact || "",
        uuid: r.uuid || "",
        validAt: r.validAt || null,
        invalidAt: r.invalidAt || null,
        score: r.score || 1.0,
        relationships: (r.relationships || []).filter((rel: any) => rel.target),
      }));
    } catch (error) {
      console.error("[Graph] Entity search failed:", error);
      return [];
    }
  }

  /**
   * Relationship traversal - find connected knowledge
   * Example: "What are the requirements for life insurance?"
   * 
   * Graphiti creates relationships like: OWNS, SUBJECTS_TO, REQUIRES, PAYS, USES
   */
  async searchByRelationship(
    sourceQuery: string,
    relationshipType?: string,
    limit: number = 10
  ): Promise<GraphSearchResult[]> {
    const queryLower = sourceQuery.toLowerCase();
    
    // Build relationship filter
    const relationshipFilter = relationshipType 
      ? `type(r) = '${relationshipType}'`
      : `type(r) IN ['OWNS', 'SUBJECTS_TO', 'REQUIRES', 'PAYS', 'USES', 'RELATED_TO']`;
    
    const cypherQuery = `
      MATCH (source)
      WHERE source.fact IS NOT NULL AND (
        toLower(source.fact) CONTAINS $query OR 
        toLower(source.name) CONTAINS $query
      )
      
      MATCH (source)-[r]->(target)
      WHERE target.fact IS NOT NULL
        AND ${relationshipFilter}
      
      RETURN 
        target.fact as fact,
        target.uuid as uuid,
        target.valid_at as validAt,
        target.invalid_at as invalidAt,
        1.0 as score,
        [{
          type: type(r), 
          target: coalesce(source.name, source.fact, ''), 
          targetFact: source.fact
        }] as relationships
      LIMIT $limit
    `;

    try {
      const results = await runGraphQuery(cypherQuery, {
        query: queryLower,
        limit,
      });

      return results.map((r: any) => ({
        fact: r.fact || "",
        uuid: r.uuid || "",
        validAt: r.validAt || null,
        invalidAt: r.invalidAt || null,
        score: r.score || 1.0,
        relationships: r.relationships || [],
      }));
    } catch (error) {
      console.error("[Graph] Relationship search failed:", error);
      return [];
    }
  }
}

// Singleton instance
let _semanticGraphSearch: SemanticGraphSearch | null = null;

export function getSemanticGraphSearch(): SemanticGraphSearch {
  if (!_semanticGraphSearch) {
    _semanticGraphSearch = new SemanticGraphSearch();
  }
  return _semanticGraphSearch;
}

