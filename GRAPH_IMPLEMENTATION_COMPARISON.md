# Graph Implementation Comparison: Python (Graphiti) vs TypeScript (Neo4j)

## Overview

**Important:** The knowledge graph was built using **Python/Graphiti during ingestion** (see `LifeCompass/ingestion/`). The graph exists in Neo4j with a Graphiti schema, but TypeScript queries it directly without Graphiti's semantic search capabilities.

**Key Insight:** Graphiti was used to **build the graph** (extract facts, entities, relationships from Old Mutual documents), but **TypeScript production app doesn't use Python** - it queries the existing Neo4j graph directly.

## Key Differences

### Python (Graphiti) Implementation - **Used for Ingestion Only**

**Locations:**
- `LifeCompass/ingestion/graph_builder.py` - Builds graph from documents
- `LifeCompass/agent/graph_utils.py` - Graphiti client wrapper

**How Graph Was Built:**

1. **Document Ingestion** (`ingest.py`):
   - Chunks Old Mutual documents into pieces
   - Generates embeddings for PostgreSQL vector search
   - Calls `graph_builder.add_document_to_graph()` for each chunk

2. **Graph Building** (`graph_builder.py`):
   - Creates **episodes** from document chunks
   - Calls `graph_client.add_episode()` which uses Graphiti
   - Graphiti **automatically extracts**:
     - **Facts** (nodes with `fact` property)
     - **Entities** (Person, Organization, Product, etc.)
     - **Relationships** (OWNS, SUBJECTS_TO, REQUIRES, PAYS, USES, etc.)
   - Graphiti uses LLM to understand semantic meaning

3. **Graphiti Schema Created:**
   - Nodes have properties: `fact`, `uuid`, `valid_at`, `invalid_at`, `source_node_uuid`
   - Entities extracted automatically (no manual schema definition)
   - Relationships inferred semantically

**Features:**
- ✅ **Semantic Fact Extraction**: LLM extracts structured facts from episode text
- ✅ **Automatic Entity Extraction**: Graphiti identifies entities (people, products, processes)
- ✅ **Intelligent Relationship Inference**: Understands semantic connections (e.g., "Customer OWNS Policy")
- ✅ **Cross-encoder Reranking**: Improves search relevance
- ✅ **Episode-based Knowledge**: Each document chunk becomes an episode
- ✅ **Built-in Index Management**: Graphiti creates Neo4j indices automatically

**Graphiti Search (Semantic):**
```python
# Graphiti uses LLM + embeddings for semantic understanding
results = await self.graphiti.search(query)  # Understands meaning, not just text

# Returns structured facts that Graphiti extracted
{
    "fact": "Old Mutual Life Insurance requires medical underwriting for coverage above R500,000",
    "uuid": "abc-123",
    "valid_at": "2025-01-01T00:00:00Z",
    "invalid_at": null,
    "source_node_uuid": "episode-xyz"
}
```

**Important:** This Python code is only used during **ingestion** to build the graph. The production TypeScript app doesn't use Python.

### TypeScript (Direct Neo4j) Implementation - **Production App**

**Locations:**
- `lifecompass-next/lib/graph/neo4j.ts` - Neo4j connection and queries
- `lifecompass-next/lib/agent/tools.ts` - Graph search tool

**Features:**
- ⚠️ **Simple Text Matching**: Only does `CONTAINS` text search on `fact` property
- ❌ **No Semantic Understanding**: No LLM integration for query understanding
- ❌ **No Entity Extraction**: Can't automatically extract new entities
- ❌ **No Relationship Inference**: Can't understand semantic connections
- ✅ **Graceful Error Handling**: Returns empty array if Neo4j fails
- ✅ **Optionally Calls Python API**: If `GRAPH_API_URL` is set, uses Python Graphiti API

**How it works:**
```typescript
// Option 1: Try Python Graphiti API (if available)
const graphApiUrl = process.env.GRAPH_API_URL;
if (graphApiUrl) {
  const response = await fetch(`${graphApiUrl}/search/graph`, {
    method: "POST",
    body: JSON.stringify({ query, limit: 10 })
  });
  // Returns semantic search results from Graphiti
}

// Option 2: Direct Neo4j query (fallback) - simple text matching
const cypherQuery = `
  MATCH (n)
  WHERE n.fact CONTAINS $query OR n.name CONTAINS $query OR n.description CONTAINS $query
  RETURN n.fact as fact, n.uuid as uuid, n.valid_at as validAt, n.invalid_at as invalidAt
  LIMIT 10
`;

const results = await runGraphQuery(cypherQuery, { query });
```

**Current Limitations:**
- If Python API not available, only finds nodes where `fact` contains query text (exact match)
- Doesn't understand semantic meaning (e.g., "insurance" won't match "policy coverage")
- Can't traverse relationships semantically
- Assumes Graphiti schema exists (`fact`, `uuid`, `valid_at`, `invalid_at` properties)
- **Graph already built** with Graphiti during ingestion, but TypeScript can't leverage semantic search

## The Problem

**TypeScript queries a Graphiti-built graph without Graphiti's semantic search.**

**What Happened:**
1. **Ingestion (Python/Graphiti):** Old Mutual documents were processed, Graphiti extracted facts, entities, and relationships into Neo4j
2. **Production (TypeScript):** TypeScript queries the same Neo4j database but uses simple text matching instead of semantic search

**The Gap:**
- Graph has rich semantic structure (facts, entities, relationships) created by Graphiti
- TypeScript can only do basic text matching (`CONTAINS` queries)
- TypeScript can't leverage the semantic understanding that Graphiti provides

**Impact:**
1. If Neo4j is configured, TypeScript might find some results (exact text matches in `fact` property)
2. But it won't find semantically related content (e.g., "insurance" → "policy coverage")
3. Search quality is significantly lower than what Graphiti would provide
4. Relationships and entities exist but aren't traversed semantically

## Solutions

### Option 1: Use Python Graphiti API (Currently Implemented)

**Status:** ✅ Already implemented in `lib/agent/tools.ts`

TypeScript tries to call Python Graphiti API first if `GRAPH_API_URL` is set:

```typescript
// Option 1: Use Python Graphiti API if available (semantic search)
const graphApiUrl = process.env.GRAPH_API_URL;
if (graphApiUrl) {
  const response = await fetch(`${graphApiUrl}/search/graph`, {
    method: "POST",
    body: JSON.stringify({ query, limit: 10 })
  });
  // Returns semantic search results from Graphiti
}
```

**Limitation:** User says they don't use Python in production, so this won't be available.

### Option 2: Implement Semantic Search in TypeScript (Recommended)

Would require:
- **Vector similarity search** in Neo4j (using embeddings stored in PostgreSQL)
- **LLM-based query understanding** (convert query to embedding, find similar facts)
- **Relationship traversal** with semantic scoring
- **Cross-encoder reranking** (optional, improves relevance)

This is complex but would provide Graphiti-like capabilities without Python dependency.

### Option 3: Enhanced Text Matching (Current Fallback)

**Status:** ✅ Currently implemented

- Searches `fact`, `name`, `description` properties with `CONTAINS`
- Returns empty array if Neo4j fails (graceful degradation)
- Accepts lower search quality
- Relies on vector/hybrid search in PostgreSQL for knowledge retrieval

**Improvement:** Could enhance with:
- Better text matching (fuzzy search, stemming)
- Relationship traversal (follow `OWNS`, `REQUIRES`, etc. relationships)
- Basic entity filtering

## Current Status

✅ **Working:**
- TypeScript gracefully handles Neo4j failures
- Chat API works without Neo4j
- Vector/hybrid search in PostgreSQL provides good results
- Graph search tool exists and tries Python API first, falls back to Neo4j

⚠️ **Limitations:**
- Graph search is basic text matching (not semantic) when Python API unavailable
- Graph has rich semantic structure but TypeScript can't leverage it
- Neo4j authentication errors are handled but graph search returns empty results
- **Graph already built** with Graphiti during ingestion, but production app doesn't use Python

## Recommendations

1. **For Production (Now):**
   - ✅ Keep current graceful error handling (already done)
   - ✅ Graph search returns empty results if Neo4j fails (acceptable)
   - ✅ Rely on vector/hybrid search in PostgreSQL for knowledge retrieval (working well)
   - ⚠️ Graph search is limited but doesn't break the app

2. **For Better Graph Search (Future):**
   - **Option A:** Implement semantic search in TypeScript using embeddings
     - Query → Embedding → Find similar facts in Neo4j
     - Traverse relationships semantically
   - **Option B:** Use Python Graphiti API as a service (if acceptable)
     - Deploy Python API separately
     - TypeScript calls it for graph search
   - **Option C:** Enhance text matching
     - Add fuzzy search, relationship traversal, entity filtering

3. **Neo4j Configuration:**
   - Verify `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD` in Vercel
   - If not configured, graph search will gracefully fail (returns empty array)
   - Graph exists from ingestion but isn't used optimally in production

## Summary

**Graph Building (Ingestion):** Python/Graphiti ✅
- Documents processed into episodes
- Facts, entities, relationships extracted semantically
- Stored in Neo4j with Graphiti schema

**Graph Querying (Production):** TypeScript ⚠️
- Queries existing Neo4j graph
- Limited to text matching (no semantic search)
- Works but search quality is lower than Graphiti
- Falls back gracefully if Neo4j unavailable

