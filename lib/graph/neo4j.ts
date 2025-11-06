// lib/graph/neo4j.ts

import neo4j, { Driver, Session } from "neo4j-driver";

let driver: Driver | null = null;

export function getNeo4jDriver(): Driver {
  if (!driver) {
    const uri = process.env.NEO4J_URI;
    const username = process.env.NEO4J_USERNAME || process.env.NEO4J_USER;
    const password = process.env.NEO4J_PASSWORD;
    
    if (!uri || !username || !password) {
      throw new Error(
        "Neo4j configuration missing. Required: NEO4J_URI, NEO4J_USERNAME (or NEO4J_USER), and NEO4J_PASSWORD"
      );
    }
    
    try {
      driver = neo4j.driver(
        uri,
        neo4j.auth.basic(username, password),
      );
    } catch (error) {
      throw new Error(`Failed to create Neo4j driver: ${error instanceof Error ? error.message : String(error)}`);
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
  
  let driver: Driver;
  let session: Session | null = null;
  
  try {
    driver = getNeo4jDriver();
    session = driver.session();

    const result = await session.run(query, params);
    return result.records.map((record) => {
      const obj: any = {};
      record.keys.forEach((key) => {
        obj[key] = record.get(key);
      });
      return obj;
    });
  } catch (error: any) {
    // Handle authentication errors gracefully
    if (error.code === "Neo.ClientError.Security.Unauthorized" || 
        error.message?.includes("authentication failure") ||
        error.message?.includes("Access denied")) {
      console.error("Neo4j authentication failed. Check NEO4J_USERNAME and NEO4J_PASSWORD.");
      console.error("Neo4j error:", error.message);
      return []; // Return empty array instead of crashing
    }
    console.error("Neo4j query error:", error.message);
    return []; // Return empty array for any other errors
  } finally {
    if (session) {
      await session.close();
    }
  }
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

  return await runGraphQuery(searchQuery, {
    query,
    limit,
  });
}

// Close driver on app shutdown
export async function closeNeo4jDriver() {
  if (driver) {
    await driver.close();
    driver = null;
  }
}
