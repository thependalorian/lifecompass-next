-- Verification query to check if hybrid_search function was updated correctly
-- Run this to verify the function uses DOUBLE PRECISION

SELECT 
    p.proname AS function_name,
    pg_get_function_result(p.oid) AS return_type,
    pg_get_function_arguments(p.oid) AS arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'hybrid_search'
AND n.nspname = 'public';

-- Also check the function definition
SELECT pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname = 'hybrid_search';

