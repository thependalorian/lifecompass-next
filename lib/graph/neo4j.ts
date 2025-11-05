// lib/graph/neo4j.ts

import neo4j, { Driver, Session } from "neo4j-driver";

let driver: Driver | null = null;

export function getNeo4jDriver(): Driver {
  if (!driver) {
    driver = neo4j.driver(
      process.env.NEO4J_URI!,
      neo4j.auth.basic(
        process.env.NEO4J_USERNAME!,
        process.env.NEO4J_PASSWORD!,
      ),
    );
  }
  return driver;
}

export async function runGraphQuery(
  query: string,
  params: Record<string, any> = {},
): Promise<any[]> {
  const driver = getNeo4jDriver();
  const session: Session = driver.session();

  try {
    const result = await session.run(query, params);
    return result.records.map((record) => {
      const obj: any = {};
      record.keys.forEach((key) => {
        obj[key] = record.get(key);
      });
      return obj;
    });
  } finally {
    await session.close();
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
