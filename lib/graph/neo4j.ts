// lib/graph/neo4j.ts

import neo4j, { Driver, Session } from "neo4j-driver";
import { getEnvVar } from "@/lib/utils/env";

let driver: Driver | null = null;

// Retry wrapper for Neo4j operations
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      // Check if it's a connection timeout or network error
      const isRetryable =
        error?.code === "ServiceUnavailable" ||
        error?.code === "TransientError" ||
        error?.message?.includes("timeout") ||
        error?.message?.includes("ECONNREFUSED") ||
        error?.message?.includes("ENOTFOUND") ||
        error?.message?.includes("fetch failed") ||
        error?.message?.includes("Connection closed");

      if (!isRetryable || attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff: wait longer between retries
      const waitTime = delayMs * Math.pow(2, attempt - 1);
      console.warn(
        `Neo4j connection attempt ${attempt}/${maxRetries} failed. Retrying in ${waitTime}ms...`,
        error?.message || error,
      );

      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw lastError || new Error("Neo4j operation failed after retries");
}

export function getNeo4jDriver(): Driver {
  if (!driver) {
    // Use validated environment variables
    const uri = getEnvVar("NEO4J_URI");
    const username = getEnvVar("NEO4J_USERNAME") || getEnvVar("NEO4J_USER");
    const password = getEnvVar("NEO4J_PASSWORD");

    if (!uri || !username || !password) {
      throw new Error(
        "Neo4j configuration missing. Required: NEO4J_URI, NEO4J_USERNAME (or NEO4J_USER), and NEO4J_PASSWORD",
      );
    }

    try {
      driver = neo4j.driver(uri, neo4j.auth.basic(username, password), {
        // Connection timeout: 10 seconds (reduced for faster failure)
        connectionTimeout: 10000,
        // Max transaction retry time: 10 seconds (reduced for streaming)
        maxTransactionRetryTime: 10000,
        // Connection pool settings
        maxConnectionPoolSize: 50,
        // Connection acquisition timeout: 15 seconds (reduced for streaming)
        connectionAcquisitionTimeout: 15000,
        // Disable connection liveness check for faster queries
        disableLosslessIntegers: true,
      });
    } catch (error) {
      throw new Error(
        `Failed to create Neo4j driver: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
  return driver;
}

export async function runGraphQuery(
  query: string,
  params: Record<string, any> = {},
): Promise<any[]> {
  // Check if Neo4j is configured before attempting connection
  if (!process.env.NEO4J_URI || !process.env.NEO4J_PASSWORD) {
    console.warn("Neo4j not configured. Skipping graph query.");
    return [];
  }

  return withRetry(async () => {
    let driver: Driver;
    let session: Session | null = null;

    try {
      driver = getNeo4jDriver();
      session = driver.session();

      // Ensure limit is an absolute integer (Neo4j requires integer for LIMIT, not float)
      const processedParams = { ...params };
      if (processedParams.limit !== undefined) {
        // Convert to absolute integer explicitly - Neo4j rejects floats like 10.0
        // Use parseInt to ensure we get a true integer, not a float
        const limitValue = processedParams.limit;
        const intLimit = parseInt(String(limitValue), 10);
        // CRITICAL: Ensure it's a true integer by using Math.floor after parseInt
        // This handles edge cases where parseInt might not fully convert
        let finalLimit = isNaN(intLimit) ? 10 : Math.floor(Math.abs(intLimit));
        
        // Add explicit conversion to Neo4j Integer type
        processedParams.limit = neo4j.int(finalLimit);
      }

      const result = await session.run(query, processedParams);
      return result.records.map((record) => {
        const obj: any = {};
        record.keys.forEach((key) => {
          obj[key] = record.get(key);
        });
        return obj;
      });
    } catch (error: any) {
      // Handle authentication errors gracefully
      if (
        error.code === "Neo.ClientError.Security.Unauthorized" ||
        error.message?.includes("authentication failure") ||
        error.message?.includes("Access denied")
      ) {
        console.error(
          "Neo4j authentication failed. Check NEO4J_USERNAME and NEO4J_PASSWORD.",
        );
        console.error("Neo4j error:", error.message);
        return []; // Return empty array instead of crashing
      }

      // Handle query syntax errors (don't retry these)
      if (
        error.code === "Neo.ClientError.Statement.SyntaxError" ||
        error.code === "Neo.ClientError.Statement.InvalidSyntax"
      ) {
        console.error("Neo4j query syntax error:", error.message);
        console.error("Query:", query.substring(0, 200));
        return []; // Return empty array for syntax errors
      }

      // Re-throw retryable errors to trigger retry logic
      const isRetryable =
        error?.code === "ServiceUnavailable" ||
        error?.code === "TransientError" ||
        error?.message?.includes("timeout") ||
        error?.message?.includes("ECONNREFUSED") ||
        error?.message?.includes("ENOTFOUND") ||
        error?.message?.includes("fetch failed") ||
        error?.message?.includes("Connection closed");

      if (isRetryable) {
        throw error; // Let retry wrapper handle it
      }

      console.error("Neo4j query error:", error.message);
      return []; // Return empty array for non-retryable errors
    } finally {
      if (session) {
        await session.close();
      }
    }
  });
}

// Graph construction utilities
export async function createCustomerNode(customerData: any) {
  const query = `
    MERGE (c:Customer {uuid: $uuid})
    SET c += $properties
    RETURN c
  `;

  return await runGraphQuery(query, {
    uuid: customerData.id,
    properties: {
      name: `${customerData.first_name} ${customerData.last_name}`,
      email: customerData.email,
      region: customerData.address_region,
      segment: customerData.segment,
      lifetimeValue: customerData.lifetime_value,
      engagementScore: customerData.engagement_score,
    },
  });
}

export async function createPolicyNode(policyData: any) {
  const query = `
    MERGE (p:Policy {uuid: $uuid})
    SET p += $properties
    RETURN p
  `;

  return await runGraphQuery(query, {
    uuid: policyData.id,
    properties: {
      policyNumber: policyData.policy_number,
      productType: policyData.product_type,
      status: policyData.status,
      coverageAmount: policyData.coverage_amount,
      premiumAmount: policyData.premium_amount,
    },
  });
}

export async function createAdvisorNode(advisorData: any) {
  const query = `
    MERGE (a:Advisor {uuid: $uuid})
    SET a += $properties
    RETURN a
  `;

  return await runGraphQuery(query, {
    uuid: advisorData.id,
    properties: {
      name: `${advisorData.first_name} ${advisorData.last_name}`,
      specialization: advisorData.specialization,
      region: advisorData.region,
      experienceYears: advisorData.experience_years,
    },
  });
}

export async function createCustomerPolicyRelationship(
  customerUuid: string,
  policyUuid: string,
) {
  const query = `
    MATCH (c:Customer {uuid: $customerUuid})
    MATCH (p:Policy {uuid: $policyUuid})
    MERGE (c)-[:OWNS]->(p)
    RETURN c, p
  `;

  return await runGraphQuery(query, {
    customerUuid,
    policyUuid,
  });
}

export async function createAdvisorCustomerRelationship(
  advisorUuid: string,
  customerUuid: string,
) {
  const query = `
    MATCH (a:Advisor {uuid: $advisorUuid})
    MATCH (c:Customer {uuid: $customerUuid})
    MERGE (a)-[:ADVISES]->(c)
    RETURN a, c
  `;

  return await runGraphQuery(query, {
    advisorUuid,
    customerUuid,
  });
}

export async function findRelatedEntities(
  entityUuid: string,
  entityType: string,
  depth = 2,
) {
  const query = `
    MATCH (e:${entityType} {uuid: $entityUuid})
    MATCH path = (e)-[*1..${depth}]-(related)
    WHERE e <> related
    RETURN DISTINCT related, type(relationships(path)[0]) as relationship
    LIMIT 20
  `;

  return await runGraphQuery(query, {
    entityUuid,
  });
}

export async function searchGraphByText(query: string, limit = 10) {
  const searchQuery = `
    MATCH (n)
    WHERE any(prop in keys(n) WHERE
      toLower(toString(n[prop])) CONTAINS toLower($query)
    )
    RETURN n, labels(n) as labels
    LIMIT $limit
  `;

  // Ensure absolute integer for Neo4j (use Math.floor after parseInt to ensure true integer)
  const intLimit = Math.floor(Math.abs(parseInt(String(limit), 10))) || 10;
  
  return await runGraphQuery(searchQuery, {
    query,
    limit: intLimit,
  });
}

// Close driver on app shutdown
export async function closeNeo4jDriver() {
  if (driver) {
    await driver.close();
    driver = null;
  }
}
