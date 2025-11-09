-- Final Fix: Ensure hybrid_search function uses DOUBLE PRECISION consistently
-- This migration drops and recreates the function to clear any cached plans

DROP FUNCTION IF EXISTS hybrid_search(vector, text, integer, double precision);

CREATE OR REPLACE FUNCTION hybrid_search(
    query_embedding vector(768),
    query_text TEXT,
    match_count INT DEFAULT 10,
    text_weight DOUBLE PRECISION DEFAULT 0.3
)
RETURNS TABLE (
    chunk_id UUID,
    document_id UUID,
    content TEXT,
    combined_score DOUBLE PRECISION,
    vector_similarity DOUBLE PRECISION,
    text_similarity DOUBLE PRECISION,
    metadata JSONB,
    document_title TEXT,
    document_source TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH vector_results AS (
        SELECT
            c.id AS chunk_id,
            c.document_id,
            c.content,
            (1 - (c.embedding <=> query_embedding))::DOUBLE PRECISION AS vector_sim,
            c.metadata,
            d.title AS doc_title,
            d.source AS doc_source
        FROM chunks c
        JOIN documents d ON c.document_id = d.id
        WHERE c.embedding IS NOT NULL
    ),
    text_results AS (
        SELECT
            c.id AS chunk_id,
            c.document_id,
            c.content,
            ts_rank_cd(to_tsvector('english', c.content), plainto_tsquery('english', query_text))::DOUBLE PRECISION AS text_sim,
            c.metadata,
            d.title AS doc_title,
            d.source AS doc_source
        FROM chunks c
        JOIN documents d ON c.document_id = d.id
        WHERE to_tsvector('english', c.content) @@ plainto_tsquery('english', query_text)
    )
    SELECT
        COALESCE(v.chunk_id, t.chunk_id) AS chunk_id,
        COALESCE(v.document_id, t.document_id) AS document_id,
        COALESCE(v.content, t.content) AS content,
        (COALESCE(v.vector_sim, 0) * (1 - text_weight) + COALESCE(t.text_sim, 0) * text_weight)::DOUBLE PRECISION AS combined_score,
        COALESCE(v.vector_sim, 0)::DOUBLE PRECISION AS vector_similarity,
        COALESCE(t.text_sim, 0)::DOUBLE PRECISION AS text_similarity,
        COALESCE(v.metadata, t.metadata) AS metadata,
        COALESCE(v.doc_title, t.doc_title) AS document_title,
        COALESCE(v.doc_source, t.doc_source) AS document_source
    FROM vector_results v
    FULL OUTER JOIN text_results t ON v.chunk_id = t.chunk_id
    ORDER BY combined_score DESC
    LIMIT match_count;
END;
$$;

-- Force PostgreSQL to recompile the function
NOTIFY pgrst, 'reload schema';

