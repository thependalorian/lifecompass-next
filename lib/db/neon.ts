// lib/db/neon.ts

import { neon } from "@neondatabase/serverless";
import { Message, Session } from "@/lib/agent/models";
import { getEnvVar } from "@/lib/utils/env";
import type {
  NeonClient,
  CustomerRow,
  AdvisorRow,
  PolicyRow,
  ClaimRow,
  TaskRow,
  CommunicationRow,
  TemplateRow,
  DocumentFileRow,
  UserUploadedDocument,
} from "@/lib/types/database";

// Lazy initialization of neon client
let sqlClient: NeonClient | null = null;

// Helper function to get sql client with error handling and retry logic
export function getSqlClient() {
  if (!sqlClient) {
    // Use validated environment variables
    const databaseUrl = getEnvVar("DATABASE_URL");

    // Initialize Neon client
    // Note: Connection timeout and retry logic are handled by the withRetry wrapper
    sqlClient = neon(databaseUrl);
  }
  return sqlClient;
}

// Retry wrapper for database operations
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if it's a connection timeout or network error
      const errorMessage = lastError.message;
      const errorCode = (error as { code?: string })?.code;
      const isRetryable =
        errorCode === "UND_ERR_CONNECT_TIMEOUT" ||
        errorMessage.includes("fetch failed") ||
        errorMessage.includes("timeout") ||
        errorMessage.includes("ECONNREFUSED") ||
        errorMessage.includes("ENOTFOUND") ||
        errorMessage.includes("ECONNRESET") ||
        errorMessage.includes("ETIMEDOUT");

      if (!isRetryable || attempt === maxRetries) {
        throw lastError;
      }

      // Exponential backoff with jitter: wait longer between retries
      const baseWaitTime = delayMs * Math.pow(2, attempt - 1);
      const jitter = Math.random() * 200; // Add 0-200ms jitter to prevent thundering herd
      const waitTime = baseWaitTime + jitter;
      
      console.warn(
        `Database connection attempt ${attempt}/${maxRetries} failed. Retrying in ${Math.round(waitTime)}ms...`,
        errorMessage.substring(0, 100), // Truncate long error messages
      );

      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw lastError || new Error("Database operation failed after retries");
}

// Session management
/**
 * Create a new session with user identity validation.
 * @param userId - Optional user identifier (customer_number or advisor_number)
 * @throws Error if userId is provided but doesn't match any valid customer or advisor
 */
export async function createSession(userId?: string): Promise<string> {
  // Validate user identity if userId is provided
  if (userId) {
    // Check if userId exists as customer_number or advisor_number
    const customerCheck = await withRetry(async () => {
      const client = getSqlClient();
      return (await client`
        SELECT id FROM customers WHERE customer_number = ${userId} LIMIT 1
      `) as Array<{ id: string }>;
    });
    
    const advisorCheck = await withRetry(async () => {
      const client = getSqlClient();
      return (await client`
        SELECT id FROM advisors WHERE advisor_number = ${userId} LIMIT 1
      `) as Array<{ id: string }>;
    });
    
    if (customerCheck.length === 0 && advisorCheck.length === 0) {
      throw new Error(
        `Invalid user identity: userId "${userId}" does not match any customer or advisor number`,
      );
    }
  }
  
  const result = await withRetry(async () => {
    const client = getSqlClient();
    return (await client`
      INSERT INTO sessions (user_id, metadata, expires_at)
      VALUES (${userId}, '{}', NOW() + INTERVAL '24 hours')
      RETURNING id::text
    `) as Array<{ id: string }>;
  });
  
  return result[0]?.id || "";
}

export async function getSession(sessionId: string): Promise<Session | null> {
  const result = await withRetry(async () => {
    const client = getSqlClient();
    return (await client`
      SELECT
        id::text,
        user_id,
        metadata,
        created_at,
        updated_at,
        expires_at
      FROM sessions
      WHERE id = ${sessionId}::uuid AND expires_at > NOW()
    `) as Array<{
      id: string;
      user_id: string | null;
      metadata: Record<string, unknown> | null;
      created_at: Date | string;
      updated_at: Date | string;
      expires_at: Date | string;
    }>;
  });

  const session = result[0];
  if (!session) return null;

  return {
    id: session.id,
    userId: session.user_id || undefined,
    metadata: session.metadata || undefined,
    createdAt: new Date(session.created_at),
    updatedAt: new Date(session.updated_at),
    expiresAt: new Date(session.expires_at),
  };
}

export async function updateSession(
  sessionId: string,
  metadata: Record<string, unknown>,
) {
  await withRetry(async () => {
    const client = getSqlClient();
    await client`
      UPDATE sessions
      SET metadata = ${JSON.stringify(metadata)}, updated_at = NOW()
      WHERE id = ${sessionId}::uuid
    `;
  });
}

/**
 * Get or create a session based on persona information.
 * This ensures conversation isolation per persona and links to actual customer/advisor records.
 * 
 * CRITICAL: Validates user identity to prevent user mixing and ensure proper isolation.
 * 
 * @param userId - Optional user identifier (must match resolved persona if provided)
 * @param personaMetadata - Persona selection metadata
 * @param existingSessionId - Optional existing session ID to reuse (will be validated)
 * @throws Error if userId doesn't match resolved persona or if persona resolution fails
 */
export async function getOrCreateSessionByPersona(
  userId?: string,
  personaMetadata?: {
    selectedCustomerPersona?: string;
    selectedAdvisorPersona?: string;
    userType?: string;
  },
  existingSessionId?: string,
): Promise<string> {
  // Resolve persona numbers to actual customer/advisor IDs
  let customerId: string | undefined;
  let advisorId: string | undefined;
  let resolvedUserId: string | undefined = userId;
  let resolvedCustomer: any = null;
  let resolvedAdvisor: any = null;

  // CRITICAL: Validate and resolve customer persona
  if (personaMetadata?.selectedCustomerPersona) {
    try {
      const customer = await getCustomerByNumber(
        personaMetadata.selectedCustomerPersona,
      );
      if (!customer) {
        throw new Error(
          `Invalid customer persona: "${personaMetadata.selectedCustomerPersona}" does not exist`,
        );
      }
      resolvedCustomer = customer;
      customerId = customer.id;
      resolvedUserId = customer.customer_number; // Use customer_number as user_id
    } catch (error) {
      console.error("Failed to resolve customer persona:", error);
      throw new Error(
        `Failed to validate customer persona "${personaMetadata.selectedCustomerPersona}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  // CRITICAL: Validate and resolve advisor persona
  if (personaMetadata?.selectedAdvisorPersona) {
    try {
      const advisor = await getAdvisorByNumber(
        personaMetadata.selectedAdvisorPersona,
      );
      if (!advisor) {
        throw new Error(
          `Invalid advisor persona: "${personaMetadata.selectedAdvisorPersona}" does not exist`,
        );
      }
      resolvedAdvisor = advisor;
      advisorId = advisor.id;
      resolvedUserId = advisor.advisor_number; // Use advisor_number as user_id
    } catch (error) {
      console.error("Failed to resolve advisor persona:", error);
      throw new Error(
        `Failed to validate advisor persona "${personaMetadata.selectedAdvisorPersona}": ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  // CRITICAL: Validate that userId matches resolved persona (if both provided)
  // Only validate if userId looks like a persona number (CUST-XXX or ADV-XXX), not a UUID
  // UUIDs are session IDs or other identifiers and should not be compared to persona numbers
  const isPersonaNumber = (id: string) => /^(CUST|ADV)-\d{3}$/i.test(id);
  
  // If userId is provided but not a persona number (e.g., UUID), use resolvedUserId instead
  // This handles cases where userId is a UUID or session ID from a previous session
  if (userId && !isPersonaNumber(userId) && resolvedUserId) {
    // userId is likely a UUID or session ID, use resolvedUserId for session creation
    // This ensures sessions are linked to the correct persona
    resolvedUserId = resolvedUserId; // Keep resolvedUserId as is
  } else if (userId && isPersonaNumber(userId) && resolvedUserId && userId !== resolvedUserId) {
    // Only validate if userId is a persona number and doesn't match resolved persona
    throw new Error(
      `User identity mismatch: userId "${userId}" does not match resolved persona "${resolvedUserId}". This prevents user mixing and ensures proper isolation.`,
    );
  }
  
  // Use resolvedUserId for session creation (it's the persona number)
  // If no persona was resolved but userId is a persona number, use userId
  if (!resolvedUserId && userId && isPersonaNumber(userId)) {
    resolvedUserId = userId;
  }

  // CRITICAL: Ensure only one persona type is selected (customer OR advisor, not both)
  if (
    personaMetadata?.selectedCustomerPersona &&
    personaMetadata?.selectedAdvisorPersona
  ) {
    throw new Error(
      "Invalid persona selection: Cannot select both customer and advisor personas simultaneously. This ensures proper user isolation.",
    );
  }

  // CRITICAL: Require at least one persona or userId for session creation
  if (!personaMetadata?.selectedCustomerPersona && !personaMetadata?.selectedAdvisorPersona && !userId) {
    throw new Error(
      "Session creation requires either a valid persona selection or userId. This ensures proper user identification and isolation.",
    );
  }

  // Build enriched metadata with resolved IDs
  const enrichedMetadata = {
    ...personaMetadata,
    customerId: customerId,
    advisorId: advisorId,
    customerNumber: personaMetadata?.selectedCustomerPersona,
    advisorNumber: personaMetadata?.selectedAdvisorPersona,
  };

  // CRITICAL: If valid UUID sessionId provided, verify it exists, belongs to this persona, and user identity matches
  if (
    existingSessionId &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      existingSessionId,
    )
  ) {
    const session = await getSession(existingSessionId);
    if (
      session &&
      session.expiresAt &&
      new Date(session.expiresAt) > new Date()
    ) {
      // CRITICAL: Validate session belongs to the correct user/persona
      const sessionUserId = session.userId;
      const sessionMetadata = session.metadata || {};
      
      // Check if session user_id matches resolved user_id
      // Only validate if both are persona numbers (not UUIDs)
      if (resolvedUserId && sessionUserId && isPersonaNumber(sessionUserId) && sessionUserId !== resolvedUserId) {
        throw new Error(
          `Session ownership mismatch: Session "${existingSessionId}" belongs to user "${sessionUserId}" but current user is "${resolvedUserId}". This prevents user mixing and ensures proper isolation.`,
        );
      }
      
      // If sessionUserId is a UUID but resolvedUserId is a persona number, check metadata instead
      if (resolvedUserId && sessionUserId && !isPersonaNumber(sessionUserId) && isPersonaNumber(resolvedUserId)) {
        // Session was created with a UUID, validate via metadata instead
        const sessionPersona = sessionMetadata.selectedCustomerPersona || sessionMetadata.selectedAdvisorPersona;
        const currentPersona = personaMetadata?.selectedCustomerPersona || personaMetadata?.selectedAdvisorPersona;
        if (sessionPersona && currentPersona && sessionPersona !== currentPersona) {
          throw new Error(
            `Session persona mismatch: Session belongs to persona "${sessionPersona}" but current persona is "${currentPersona}". This prevents user mixing.`,
          );
        }
      }
      
      // Check if session persona matches current persona
      if (personaMetadata?.selectedCustomerPersona) {
        const sessionCustomerPersona = sessionMetadata.selectedCustomerPersona;
        if (sessionCustomerPersona && sessionCustomerPersona !== personaMetadata.selectedCustomerPersona) {
          throw new Error(
            `Session persona mismatch: Session belongs to customer "${sessionCustomerPersona}" but current persona is "${personaMetadata.selectedCustomerPersona}". This prevents user mixing.`,
          );
        }
      }
      
      if (personaMetadata?.selectedAdvisorPersona) {
        const sessionAdvisorPersona = sessionMetadata.selectedAdvisorPersona;
        if (sessionAdvisorPersona && sessionAdvisorPersona !== personaMetadata.selectedAdvisorPersona) {
          throw new Error(
            `Session persona mismatch: Session belongs to advisor "${sessionAdvisorPersona}" but current persona is "${personaMetadata.selectedAdvisorPersona}". This prevents user mixing.`,
          );
        }
      }
      
      // Update metadata if persona info changed (only if validation passed)
      if (personaMetadata) {
        const currentMetadata = session.metadata || {};
        const updatedMetadata = {
          ...currentMetadata,
          ...enrichedMetadata,
        };
        await updateSession(existingSessionId, updatedMetadata);
      }
      return existingSessionId;
    }
  }

  // Look for existing active session for this persona
  // IMPORTANT: Match EXACT persona to ensure user isolation
  if (personaMetadata) {
    const personaId =
      personaMetadata.selectedAdvisorPersona ||
      personaMetadata.selectedCustomerPersona;
    if (personaId) {
      // Try to find existing session for this EXACT persona
      // Use AND logic to ensure both persona fields match exactly (or are both null)
      let result: Array<{ id: string }>;
      
      if (personaMetadata.selectedCustomerPersona) {
        // Customer persona: match customer persona exactly, advisor must be null or not exist
        // Using ->'key' IS NULL checks if key doesn't exist OR value is JSON null
        result = await withRetry(async () => {
          const client = getSqlClient();
          return (await client`
            SELECT id::text
            FROM sessions
            WHERE expires_at > NOW()
              AND (metadata->>'selectedCustomerPersona' = ${personaMetadata.selectedCustomerPersona})
              AND (metadata->'selectedAdvisorPersona' IS NULL)
            ORDER BY created_at DESC
            LIMIT 1
          `) as Array<{ id: string }>;
        });
      } else if (personaMetadata.selectedAdvisorPersona) {
        // Advisor persona: match advisor persona exactly, customer must be null or not exist
        result = await withRetry(async () => {
          const client = getSqlClient();
          return (await client`
            SELECT id::text
            FROM sessions
            WHERE expires_at > NOW()
              AND (metadata->>'selectedAdvisorPersona' = ${personaMetadata.selectedAdvisorPersona})
              AND (metadata->'selectedCustomerPersona' IS NULL)
            ORDER BY created_at DESC
            LIMIT 1
          `) as Array<{ id: string }>;
        });
      } else {
        result = [];
      }

      if (result.length > 0) {
        // Update metadata and return existing session
        await updateSession(result[0].id, {
          ...enrichedMetadata,
          ...(await getSession(result[0].id))?.metadata,
        });
        return result[0].id;
      }
    }
  }

  // Create new session with enriched persona metadata
  const result = await withRetry(async () => {
    const client = getSqlClient();
    return (await client`
      INSERT INTO sessions (user_id, metadata, expires_at)
      VALUES (${resolvedUserId}, ${JSON.stringify(enrichedMetadata)}, NOW() + INTERVAL '24 hours')
      RETURNING id::text
    `) as Array<{ id: string }>;
  });

  return result[0]?.id || "";
}

// Message management
export async function addMessage(
  sessionId: string,
  role: string,
  content: string,
  metadata?: Record<string, unknown>,
): Promise<string> {
  const result = await withRetry(async () => {
    const client = getSqlClient();
    return (await client`
      INSERT INTO messages (session_id, role, content, metadata)
      VALUES (${sessionId}::uuid, ${role}, ${content}, ${JSON.stringify(metadata || {})})
      RETURNING id::text
    `) as Array<{ id: string }>;
  });
  return result[0]?.id || "";
}

export async function getSessionMessages(
  sessionId: string,
  limit = 50,
): Promise<Array<{ role: string; content: string }>> {
  const messages = await withRetry(async () => {
    const client = getSqlClient();
    return (await client`
      SELECT role, content
      FROM messages
      WHERE session_id = ${sessionId}::uuid
      ORDER BY created_at ASC
      LIMIT ${limit}
    `) as Array<{ role: string; content: string }>;
  });

  return messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));
}

/**
 * Delete chat history for a specific session/user.
 * Only deletes messages and sessions - does not affect seed data (customers, advisors, policies, claims, interactions).
 */
export async function deleteChatHistory(
  sessionId: string,
  userId?: string,
): Promise<{ messagesDeleted: number; sessionsDeleted: number }> {
  const client = getSqlClient();

  try {
    // Count messages BEFORE deleting (for return value)
    const messagesCountBefore = (await client`
      SELECT COUNT(*)::int as count
      FROM messages
      WHERE session_id = ${sessionId}::uuid
    `) as Array<{ count: number }>;
    const messagesDeleted = messagesCountBefore[0]?.count || 0;

    // Delete all messages for this session
    await client`
      DELETE FROM messages
      WHERE session_id = ${sessionId}::uuid
    `;

    // Check if session exists before deleting
    const sessionExists = (await client`
      SELECT COUNT(*)::int as count
      FROM sessions
      WHERE id = ${sessionId}::uuid
    `) as Array<{ count: number }>;
    const sessionsDeleted = sessionExists[0]?.count > 0 ? 1 : 0;

    // Delete the session itself (only if it matches the sessionId)
    // This ensures we only delete the specific session, not other sessions
    await client`
      DELETE FROM sessions
      WHERE id = ${sessionId}::uuid
    `;

    // Also delete any expired sessions for this user_id if provided (for cleanup)
    // This helps when switching personas - cleans up old expired sessions only
    // IMPORTANT: Only deletes expired sessions (>1 hour old) to avoid affecting active sessions
    if (userId) {
      await client`
        DELETE FROM sessions
        WHERE user_id = ${userId}
          AND id != ${sessionId}::uuid
          AND expires_at < NOW() - INTERVAL '1 hour'
      `;
    }

    return {
      messagesDeleted,
      sessionsDeleted,
    };
  } catch (error) {
    console.error("Failed to delete chat history:", error);
    throw error;
  }
}

// Customer data access
export async function getCustomerById(
  customerId: string,
): Promise<CustomerRow | undefined> {
  const client = getSqlClient();
  const result = (await client`
    SELECT
      id::text,
      customer_number,
      first_name,
      last_name,
      email,
      phone_primary,
      phone_secondary,
      date_of_birth,
      national_id,
      address_street,
      address_city,
      address_region,
      address_postal_code,
      occupation,
      employer,
      monthly_income,
      marital_status,
      dependents_count,
      risk_profile,
      segment,
      digital_adoption_level,
      preferred_language,
      preferred_contact_method,
      lifetime_value,
      engagement_score,
      churn_risk,
      primary_advisor_id::text,
      avatar_url
    FROM customers
    WHERE id = ${customerId}::uuid
  `) as CustomerRow[];

  return result[0];
}

export async function getCustomerPolicies(
  customerId: string,
): Promise<PolicyRow[]> {

  const client = getSqlClient();
  const policies = (await withRetry(async () => {
    return await client`
      SELECT
        id::text,
        policy_number,
        customer_id::text,
        product_type,
        product_subtype,
        status,
        coverage_amount,
        premium_amount,
        premium_frequency,
        start_date,
        end_date,
        renewal_date,
        sum_assured,
        beneficiaries,
        underwriting_class,
        payment_method,
        payment_status,
        commission_amount,
        advisor_id::text,
        created_at,
        updated_at
      FROM policies
      WHERE customer_id = ${customerId}::uuid
      ORDER BY created_at DESC
    `;
  })) as PolicyRow[];


  return policies;
}

export async function getCustomerClaims(
  customerId: string,
): Promise<ClaimRow[]> {

  const client = getSqlClient();
  const claims = (await withRetry(async () => {
    return await client`
      SELECT
        id::text,
        claim_number,
        policy_id::text,
        customer_id::text,
        claim_type,
        status,
        incident_date,
        reported_date,
        approved_amount,
        paid_amount,
        processing_time_days,
        assessor_id::text,
        documents,
        cause_of_loss,
        reserve_amount,
        created_at
      FROM claims
      WHERE customer_id = ${customerId}::uuid
      ORDER BY created_at DESC
    `;
  })) as ClaimRow[];


  return claims;
}

export async function getAllClaims(
  limit = 100,
): Promise<(ClaimRow & { customer_number?: string })[]> {
  const client = getSqlClient();
  const claims = await client`
    SELECT
      c.id::text,
      c.claim_number,
      c.policy_id::text,
      c.customer_id::text,
      cust.customer_number,
      c.claim_type,
      c.status,
      c.incident_date,
      c.reported_date,
      c.approved_amount,
      c.paid_amount,
      c.processing_time_days,
      c.assessor_id::text,
      c.documents,
      c.cause_of_loss,
      c.reserve_amount,
      c.created_at
    FROM claims c
    LEFT JOIN customers cust ON c.customer_id = cust.id
    ORDER BY c.created_at DESC
    LIMIT ${limit}
  `;

  return claims as (ClaimRow & { customer_number?: string })[];
}

// Advisor data access
export async function getAdvisorById(
  advisorId: string,
): Promise<AdvisorRow | undefined> {
  const client = getSqlClient();
  const result = (await client`
    SELECT
      id::text,
      advisor_number,
      first_name,
      last_name,
      email,
      phone,
      specialization,
      experience_years,
      region,
      branch,
      active_clients,
      monthly_target,
      monthly_sales,
      conversion_rate,
      satisfaction_score,
      performance_rating,
      commission_rate,
      avatar_url,
      manager_id::text
    FROM advisors
    WHERE id = ${advisorId}::uuid
  `) as AdvisorRow[];

  return result[0];
}

export async function getAdvisorClients(
  advisorId: string,
  limit = 50,
): Promise<
  Pick<
    CustomerRow,
    | "id"
    | "customer_number"
    | "first_name"
    | "last_name"
    | "email"
    | "phone_primary"
    | "segment"
    | "engagement_score"
    | "lifetime_value"
    | "churn_risk"
    | "primary_advisor_id"
  >[]
> {

  const client = getSqlClient();
  const clients = (await withRetry(async () => {
    return await client`
      SELECT
        c.id::text,
        c.customer_number,
        c.first_name,
        c.last_name,
        c.email,
        c.phone_primary,
        c.segment,
        c.engagement_score,
        c.lifetime_value,
        c.churn_risk,
        c.primary_advisor_id::text
      FROM customers c
      WHERE c.primary_advisor_id = ${advisorId}::uuid
      ORDER BY c.engagement_score DESC
      LIMIT ${limit}
    `;
  })) as Pick<
    CustomerRow,
    | "id"
    | "customer_number"
    | "first_name"
    | "last_name"
    | "email"
    | "phone_primary"
    | "segment"
    | "engagement_score"
    | "lifetime_value"
    | "churn_risk"
    | "primary_advisor_id"
  >[];


  return clients;
}

export async function getAllAdvisors(): Promise<AdvisorRow[]> {
  const client = getSqlClient();
  const advisors = await client`
    SELECT
      id::text,
      advisor_number,
      first_name,
      last_name,
      email,
      phone,
      specialization,
      experience_years,
      region,
      branch,
      active_clients,
      monthly_target,
      monthly_sales,
      conversion_rate,
      satisfaction_score,
      performance_rating,
      commission_rate,
      avatar_url,
      manager_id::text
    FROM advisors
    ORDER BY advisor_number
  `;

  return advisors as AdvisorRow[];
}

export async function getAdvisorByNumber(
  advisorNumber: string,
): Promise<AdvisorRow | undefined> {

  const client = getSqlClient();
  const advisorResult = await withRetry(async () => {
    return (await client`
      SELECT
        id::text,
        advisor_number,
        first_name,
        last_name,
        email,
        phone,
      specialization,
      experience_years,
      region,
      branch,
      active_clients,
      monthly_target,
      monthly_sales,
      conversion_rate,
      satisfaction_score,
      performance_rating,
        commission_rate,
        avatar_url,
        manager_id::text
    FROM advisors
    WHERE advisor_number = ${advisorNumber}
  `) as AdvisorRow[];
  });
  const advisor = advisorResult[0];

  if (advisor) {
  }

  return advisor;
}

export async function getAllCustomers(): Promise<CustomerRow[]> {
  return withRetry(async () => {
    const client = getSqlClient();
    const customers = await client`
      SELECT
        id::text,
        customer_number,
        first_name,
        last_name,
        email,
        phone_primary,
        phone_secondary,
        date_of_birth,
        national_id,
        address_street,
        address_city,
        address_region,
        address_postal_code,
        occupation,
        employer,
        monthly_income,
        marital_status,
        dependents_count,
        risk_profile,
        segment,
        digital_adoption_level,
        preferred_language,
        preferred_contact_method,
        engagement_score,
        lifetime_value,
        churn_risk,
        primary_advisor_id::text,
        avatar_url
      FROM customers
      ORDER BY customer_number
    `;

    return customers as CustomerRow[];
  });
}

export async function getCustomerByNumber(
  customerNumber: string,
): Promise<CustomerRow | undefined> {

  const customer = await withRetry(async () => {
    const client = getSqlClient();
    const result = (await client`
      SELECT
        id::text,
        customer_number,
        first_name,
        last_name,
        email,
        phone_primary,
        phone_secondary,
        date_of_birth,
        national_id,
        address_street,
        address_city,
        address_region,
        address_postal_code,
        occupation,
        employer,
        monthly_income,
        marital_status,
        dependents_count,
        risk_profile,
        segment,
        digital_adoption_level,
        preferred_language,
        preferred_contact_method,
        engagement_score,
        lifetime_value,
        churn_risk,
        primary_advisor_id::text,
        avatar_url
      FROM customers
      WHERE customer_number = ${customerNumber}
    `) as CustomerRow[];
    return result[0];
  });

  return customer;
}

export async function getAdvisorTasks(
  advisorId: string,
  status?: "open" | "completed" | "cancelled" | "in_progress",
  priority?: "high" | "medium" | "low" | "urgent",
): Promise<TaskRow[]> {
  const client = getSqlClient();

  // Map lowercase API values to database values (case-insensitive)
  const statusMap: Record<string, string[]> = {
    open: ["Open"], // "open" matches only "Open" status
    in_progress: ["In Progress"], // "in_progress" matches "In Progress" status
    completed: ["Completed"],
    cancelled: ["Cancelled"],
  };

  const priorityMap: Record<string, string> = {
    low: "Low",
    medium: "Medium",
    high: "High",
    urgent: "Urgent",
  };

  // Convert status to database format
  const dbStatuses = status ? statusMap[status.toLowerCase()] || [] : null;
  const dbPriority = priority ? priorityMap[priority.toLowerCase()] : null;

  // Build query with proper parameterization
  if (dbStatuses && dbStatuses.length > 0 && dbPriority) {
    // Build status condition - handle single element array
    const statusValue = dbStatuses[0];
    const tasks = (await client`
      SELECT
        t.id::text,
        t.task_number,
        t.advisor_id::text,
        t.customer_id::text,
        c.customer_number,
        c.first_name || ' ' || c.last_name AS customer_name,
        t.task_type,
        t.title,
        t.description,
        t.priority,
        t.status,
        t.due_date,
        t.completed_date,
        t.estimated_hours,
        t.actual_hours,
        t.created_at
      FROM tasks t
      LEFT JOIN customers c ON t.customer_id = c.id
      WHERE t.advisor_id = ${advisorId}::uuid
        AND t.status = ${statusValue}
        AND LOWER(t.priority) = LOWER(${dbPriority})
      ORDER BY t.due_date ASC NULLS LAST, t.priority DESC
    `) as TaskRow[];
    return tasks;
  } else if (dbStatuses && dbStatuses.length > 0) {
    // Build status condition - handle single element array
    const statusValue = dbStatuses[0];
    const tasks = (await client`
      SELECT
        t.id::text,
        t.task_number,
        t.advisor_id::text,
        t.customer_id::text,
        c.customer_number,
        c.first_name || ' ' || c.last_name AS customer_name,
        t.task_type,
        t.title,
        t.description,
        t.priority,
        t.status,
        t.due_date,
        t.completed_date,
        t.estimated_hours,
        t.actual_hours,
        t.created_at
      FROM tasks t
      LEFT JOIN customers c ON t.customer_id = c.id
      WHERE t.advisor_id = ${advisorId}::uuid
        AND t.status = ${statusValue}
      ORDER BY t.due_date ASC NULLS LAST, t.priority DESC
    `) as TaskRow[];
    return tasks;
  } else if (dbPriority) {
    const tasks = (await client`
      SELECT
        t.id::text,
        t.task_number,
        t.advisor_id::text,
        t.customer_id::text,
        c.customer_number,
        c.first_name || ' ' || c.last_name AS customer_name,
        t.task_type,
        t.title,
        t.description,
        t.priority,
        t.status,
        t.due_date,
        t.completed_date,
        t.estimated_hours,
        t.actual_hours,
        t.created_at
      FROM tasks t
      LEFT JOIN customers c ON t.customer_id = c.id
      WHERE t.advisor_id = ${advisorId}::uuid
        AND LOWER(t.priority) = LOWER(${dbPriority})
      ORDER BY t.due_date ASC NULLS LAST, t.priority DESC
    `) as TaskRow[];
    return tasks;
  } else {
    const tasks = (await client`
      SELECT
        t.id::text,
        t.task_number,
        t.advisor_id::text,
        t.customer_id::text,
        c.customer_number,
        c.first_name || ' ' || c.last_name AS customer_name,
        t.task_type,
        t.title,
        t.description,
        t.priority,
        t.status,
        t.due_date,
        t.completed_date,
        t.estimated_hours,
        t.actual_hours,
        t.created_at
      FROM tasks t
      LEFT JOIN customers c ON t.customer_id = c.id
      WHERE t.advisor_id = ${advisorId}::uuid
      ORDER BY t.due_date ASC NULLS LAST, t.priority DESC
    `) as TaskRow[];
    return tasks;
  }
}

export async function getCustomerInteractions(
  customerId: string,
  limit: number = 10,
): Promise<
  Array<{
    id: string;
    interaction_number: string;
    customer_id: string;
    advisor_id: string | null;
    interaction_type: string;
    channel: string;
    direction: string;
    subject: string | null;
    content: string | null;
    sentiment: string | null;
    intent: string | null;
    outcome: string | null;
    duration_minutes: number | null;
    quality_score: number | null;
    follow_up_required: boolean;
    follow_up_date: Date | string | null;
    created_at: Date | string;
  }>
> {
  const client = getSqlClient();
  const interactions = (await client`
    SELECT
      id::text,
      interaction_number,
      customer_id::text,
      advisor_id::text,
      interaction_type,
      channel,
      direction,
      subject,
      content,
      sentiment,
      intent,
      outcome,
      duration_minutes,
      quality_score,
      follow_up_required,
      follow_up_date,
      created_at
    FROM interactions
    WHERE customer_id = ${customerId}::uuid
    ORDER BY created_at DESC
    LIMIT ${limit}
  `) as Array<{
    id: string;
    interaction_number: string;
    customer_id: string;
    advisor_id: string | null;
    interaction_type: string;
    channel: string;
    direction: string;
    subject: string | null;
    content: string | null;
    sentiment: string | null;
    intent: string | null;
    outcome: string | null;
    duration_minutes: number | null;
    quality_score: number | null;
    follow_up_required: boolean;
    follow_up_date: Date | string | null;
    created_at: Date | string;
  }>;

  return interactions;
}

/**
 * Create an interaction record for chat messages.
 * This ensures all chat interactions are tracked in the CRM system.
 */
export async function createChatInteraction(
  sessionId: string,
  message: string,
  role: "user" | "assistant",
): Promise<string | null> {
  const client = getSqlClient();

  try {
    // Get session to extract customer/advisor info
    const session = await getSession(sessionId);
    if (!session || !session.metadata) {
      return null; // No session or metadata, skip interaction creation
    }

    const metadata = session.metadata as any;
    const customerId = metadata.customerId;
    const advisorId = metadata.advisorId;

    // Only create interactions for user messages (to avoid duplicates)
    // For customers: require customerId; for advisors: require advisorId
    if (role !== "user") {
      return null;
    }
    
    // Skip if neither customerId nor advisorId is present
    if (!customerId && !advisorId) {
      return null;
    }
    
    // Validate UUIDs are valid before casting
    const isValidUUID = (id: string | undefined | null): boolean => {
      if (!id) return false;
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    };
    
    const validCustomerId = customerId && isValidUUID(customerId) ? customerId : null;
    const validAdvisorId = advisorId && isValidUUID(advisorId) ? advisorId : null;
    
    // Skip if no valid IDs
    if (!validCustomerId && !validAdvisorId) {
      return null;
    }

    // Generate interaction number (format: INT-YYYY-NNNNNN)
    const year = new Date().getFullYear();
    const interactionCount = (await client`
      SELECT COUNT(*)::int as count FROM interactions WHERE interaction_number LIKE ${`INT-${year}-%`}
    `) as Array<{ count: number }>;
    const nextNumber = (interactionCount[0]?.count || 0) + 1;
    const interactionNumber = `INT-${year}-${String(nextNumber).padStart(6, "0")}`;

    // Extract intent from message (simple keyword matching)
    let intent = "Inquiry";
    const messageLower = message.toLowerCase();
    if (messageLower.includes("claim") || messageLower.includes("claim")) {
      intent = "Claim";
    } else if (
      messageLower.includes("policy") ||
      messageLower.includes("coverage")
    ) {
      intent = "Inquiry";
    } else if (
      messageLower.includes("buy") ||
      messageLower.includes("purchase") ||
      messageLower.includes("quote")
    ) {
      intent = "Purchase";
    } else if (
      messageLower.includes("complaint") ||
      messageLower.includes("issue") ||
      messageLower.includes("problem")
    ) {
      intent = "Complaint";
    } else if (
      messageLower.includes("renew") ||
      messageLower.includes("renewal")
    ) {
      intent = "Renewal";
    } else if (
      messageLower.includes("help") ||
      messageLower.includes("support")
    ) {
      intent = "Support";
    }

    // Insert interaction
    // IMPORTANT: Don't append ::uuid to the string - Neon SQL client handles UUID casting automatically
    // Also strip any existing ::uuid suffix that might have been added elsewhere
    const cleanCustomerId = validCustomerId?.replace(/::uuid$/i, '') || null;
    const cleanAdvisorId = validAdvisorId?.replace(/::uuid$/i, '') || null;
    
    const interactionResult = (await client`
      INSERT INTO interactions (
        interaction_number,
        customer_id,
        advisor_id,
        interaction_type,
        channel,
        direction,
        subject,
        content,
        intent,
        outcome,
        created_at,
        metadata
      ) VALUES (
        ${interactionNumber},
        ${cleanCustomerId ? cleanCustomerId : null}::uuid,
        ${cleanAdvisorId ? cleanAdvisorId : null}::uuid,
        'Chat',
        'Web Chat',
        'Inbound',
        ${intent === "Purchase" ? "New Policy Interest" : intent === "Claim" ? "Claim Inquiry" : "Policy Inquiry"},
        ${message.substring(0, 500)}, -- Truncate to 500 chars
        ${intent},
        'Information Provided',
        NOW(),
        ${JSON.stringify({
          sessionId: sessionId,
          role: role,
          source: "chat_widget",
        })}
      )
      RETURNING id::text, interaction_number
    `) as Array<{ id: string; interaction_number: string }>;

    return interactionResult[0]?.interaction_number || null;
  } catch (error) {
    console.error("Failed to create chat interaction:", error);
    return null; // Don't fail the chat if interaction creation fails
  }
}

export async function getAllDocuments(
  category?: string,
  documentType?: string,
): Promise<DocumentFileRow[]> {
  const client = getSqlClient();

  if (category && documentType) {
    const documents = (await client`
      SELECT
        id::text,
        document_number,
        title,
        filename,
        file_path,
        original_url,
        file_size_bytes,
        content_type,
        category,
        subcategory,
        document_type,
        description,
        tags,
        download_count,
        view_count,
        is_active,
        created_at,
        updated_at
      FROM document_files
      WHERE is_active = true
        AND category = ${category}
        AND document_type = ${documentType}
      ORDER BY category, document_type, title
    `) as DocumentFileRow[];
    return documents;
  } else if (category) {
    const documents = (await client`
      SELECT
        id::text,
        document_number,
        title,
        filename,
        file_path,
        original_url,
        file_size_bytes,
        content_type,
        category,
        subcategory,
        document_type,
        description,
        tags,
        download_count,
        view_count,
        is_active,
        created_at,
        updated_at
      FROM document_files
      WHERE is_active = true
        AND category = ${category}
      ORDER BY category, document_type, title
    `) as DocumentFileRow[];
    return documents;
  } else if (documentType) {
    const documents = (await client`
      SELECT
        id::text,
        document_number,
        title,
        filename,
        file_path,
        original_url,
        file_size_bytes,
        content_type,
        category,
        subcategory,
        document_type,
        description,
        tags,
        download_count,
        view_count,
        is_active,
        created_at,
        updated_at
      FROM document_files
      WHERE is_active = true
        AND document_type = ${documentType}
      ORDER BY category, document_type, title
    `) as DocumentFileRow[];
    return documents;
  } else {
    const documents = (await client`
      SELECT
        id::text,
        document_number,
        title,
        filename,
        file_path,
        original_url,
        file_size_bytes,
        content_type,
        category,
        subcategory,
        document_type,
        description,
        tags,
        download_count,
        view_count,
        is_active,
        created_at,
        updated_at
      FROM document_files
      WHERE is_active = true
      ORDER BY category, document_type, title
    `) as DocumentFileRow[];
    return documents;
  }
}

export async function getDocumentByNumber(
  documentNumber: string,
): Promise<DocumentFileRow | undefined> {
  const client = getSqlClient();
  const result = (await client`
    SELECT
      id::text,
      document_number,
      title,
      filename,
      file_path,
      original_url,
      file_size_bytes,
      content_type,
      category,
      subcategory,
      document_type,
      description,
      tags,
      download_count,
      view_count,
      is_active,
      created_at,
      updated_at
    FROM document_files
    WHERE document_number = ${documentNumber}
  `) as DocumentFileRow[];

  return result[0];
}

export async function incrementDocumentDownloadCount(documentNumber: string) {
  const client = getSqlClient();
  await client`
    UPDATE document_files
    SET download_count = download_count + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE document_number = ${documentNumber}
  `;
}

export async function incrementDocumentViewCount(documentNumber: string) {
  const client = getSqlClient();
  await client`
    UPDATE document_files
    SET view_count = view_count + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE document_number = ${documentNumber}
  `;
}

// Analytics table queries with caching
export async function getAdvisorPerformance(
  advisorId: string,
  period: "month" | "quarter" | "year" = "month",
) {

  const client = getSqlClient();
  const performance = await withRetry(async () => {
    // Calculate date range based on period - use parameterized queries
    // Note: Schema uses: date, clients_served, new_sales, renewals, customer_satisfaction
    if (period === "month") {
      return await client`
        SELECT
          id::text,
          advisor_id::text,
          date,
          clients_served,
          new_sales,
          renewals,
          conversion_rate,
          avg_response_time_hours,
          customer_satisfaction,
          tasks_completed,
          tasks_overdue
        FROM advisor_performance
        WHERE advisor_id = ${advisorId}::uuid
          AND DATE_TRUNC('month', date) = DATE_TRUNC('month', CURRENT_DATE)
        ORDER BY date DESC
        LIMIT 12
      `;
    } else if (period === "quarter") {
      return await client`
        SELECT
          id::text,
          advisor_id::text,
          date,
          clients_served,
          new_sales,
          renewals,
          conversion_rate,
          avg_response_time_hours,
          customer_satisfaction,
          tasks_completed,
          tasks_overdue
        FROM advisor_performance
        WHERE advisor_id = ${advisorId}::uuid
          AND DATE_TRUNC('quarter', date) = DATE_TRUNC('quarter', CURRENT_DATE)
        ORDER BY date DESC
        LIMIT 12
      `;
    } else {
      return await client`
        SELECT
          id::text,
          advisor_id::text,
          date,
          clients_served,
          new_sales,
          renewals,
          conversion_rate,
          avg_response_time_hours,
          customer_satisfaction,
          tasks_completed,
          tasks_overdue
        FROM advisor_performance
        WHERE advisor_id = ${advisorId}::uuid
          AND DATE_TRUNC('year', date) = DATE_TRUNC('year', CURRENT_DATE)
        ORDER BY date DESC
        LIMIT 12
      `;
    }
  });

  // Cache for 5 minutes (analytics data changes moderately)

  return performance;
}

// Get monthly aggregated performance data for trend charts (last 6 months)
export async function getAdvisorMonthlyTrends(
  advisorId: string,
  months: number = 6,
) {

  const client = getSqlClient();
  const trends = await withRetry(async () => {
    // Calculate the cutoff date in JavaScript to avoid SQL parameterization issues with INTERVAL
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);
    const cutoffDateStr = cutoffDate.toISOString().split("T")[0]; // YYYY-MM-DD format

    return (await client`
      SELECT
        DATE_TRUNC('month', date) as month,
        SUM(clients_served)::int as clients,
        -- Count weeks with sales (approximation - each week with new_sales > 0 counts as 1 policy)
        -- This is an estimate since advisor_performance stores premium amounts, not policy counts
        SUM(CASE WHEN new_sales > 0 THEN 1 ELSE 0 END)::int as policies,
        SUM(new_sales + renewals)::numeric as revenue,
        AVG(conversion_rate)::numeric as conversion_rate,
        AVG(avg_response_time_hours)::numeric as avg_response_time,
        AVG(customer_satisfaction)::numeric as satisfaction,
        SUM(tasks_completed)::int as tasks_completed
      FROM advisor_performance
      WHERE advisor_id = ${advisorId}::uuid
        AND date >= ${cutoffDateStr}::date
      GROUP BY DATE_TRUNC('month', date)
      ORDER BY month DESC
      LIMIT ${months}
    `) as Array<{
      month: Date | string;
      clients: number;
      policies: number;
      revenue: number;
      conversion_rate: number;
      avg_response_time: number;
      satisfaction: number;
      tasks_completed: number;
    }>;
  });

  // Cache for 5 minutes

  return trends;
}

export async function getAdvisorSummary(advisorId: string) {

  const client = getSqlClient();
  const summaryResult = await withRetry(async () => {
    return (await client`
      SELECT
        id::text,
        advisor_id::text,
        total_clients,
        active_policies,
        total_premium_value,
        average_client_lifetime_value,
        top_segment,
        conversion_rate,
        client_satisfaction_score,
        last_updated
      FROM advisor_summary
      WHERE advisor_id = ${advisorId}::uuid
      ORDER BY last_updated DESC
      LIMIT 1
    `) as Array<{
      id: string;
      advisor_id: string;
      total_clients: number | null;
      active_policies: number | null;
      total_premium_value: number | null;
      average_client_lifetime_value: number | null;
      top_segment: string | null;
      conversion_rate: number | null;
      client_satisfaction_score: number | null;
      last_updated: Date | string;
    }>;
  });
  const summary = summaryResult[0];

  // Cache for 5 minutes
  if (summary) {
  }

  return summary;
}

export async function getCustomerAnalytics(customerId: string, limit = 30) {

  const client = getSqlClient();
  const analytics = await withRetry(async () => {
    return await client`
      SELECT
        id::text,
        customer_id::text,
        recorded_at,
        engagement_score,
        lifetime_value,
        policy_count,
        claim_count,
        interaction_count,
        last_interaction_date,
        churn_risk_score,
        segment
      FROM customer_analytics
      WHERE customer_id = ${customerId}::uuid
      ORDER BY recorded_at DESC
      LIMIT ${limit}
    `;
  });

  // Cache for 5 minutes

  return analytics;
}

export async function getCustomerSummary(customerId: string) {

  const client = getSqlClient();
  const summaryResult = await withRetry(async () => {
    return (await client`
      SELECT
        id::text,
        customer_id::text,
        total_policies,
        active_policies,
        total_coverage_value,
        total_premium_paid,
        total_claims,
        lifetime_value,
        engagement_score,
        churn_risk,
        primary_segment,
        last_updated
      FROM customer_summary
      WHERE customer_id = ${customerId}::uuid
      ORDER BY last_updated DESC
      LIMIT 1
    `) as Array<{
      id: string;
      customer_id: string;
      total_policies: number | null;
      active_policies: number | null;
      total_coverage_value: number | null;
      total_premium_paid: number | null;
      total_claims: number | null;
      lifetime_value: number | null;
      engagement_score: number | null;
      churn_risk: string | null;
      primary_segment: string | null;
      last_updated: Date | string;
    }>;
  });
  const summary = summaryResult[0];

  // Cache for 5 minutes
  if (summary) {
  }

  return summary;
}

// Optimized query: Get advisor performance aggregated stats
export async function getAdvisorPerformanceStats(advisorId: string) {

  const client = getSqlClient();
  const statsResult = await withRetry(async () => {
    return (await client`
      SELECT
        COUNT(*) as total_records,
        SUM(clients_served) as total_new_clients,
        SUM(new_sales) as total_policies_sold,
        SUM(new_sales + renewals) as total_premium_generated,
        AVG(conversion_rate) as avg_conversion_rate,
        AVG(avg_response_time_hours) as avg_response_time,
        AVG(customer_satisfaction) as avg_satisfaction,
        SUM(tasks_completed) as total_tasks_completed,
        0 as total_meetings
      FROM advisor_performance
      WHERE advisor_id = ${advisorId}::uuid
        AND date >= CURRENT_DATE - INTERVAL '3 months'
    `) as Array<{
      total_records: number | null;
      total_new_clients: number | null;
      total_policies_sold: number | null;
      total_premium_generated: number | null;
      avg_conversion_rate: number | null;
      avg_response_time: number | null;
      avg_satisfaction: number | null;
      total_tasks_completed: number | null;
      total_meetings: number | null;
    }>;
  });
  const stats = statsResult[0];

  // Cache for 2 minutes (stats change more frequently)
  if (stats) {
  }

  return stats;
}

// Search functions
export async function searchCustomers(query: string, limit = 20) {
  const client = getSqlClient();
  const customers = await client`
    SELECT
      id::text,
      customer_number,
      first_name,
      last_name,
      email,
      phone_primary,
      segment,
      engagement_score
    FROM customers
    WHERE
      first_name ILIKE ${"%" + query + "%"} OR
      last_name ILIKE ${"%" + query + "%"} OR
      email ILIKE ${"%" + query + "%"} OR
      customer_number ILIKE ${"%" + query + "%"}
    ORDER BY engagement_score DESC
    LIMIT ${limit}
  `;

  return customers;
}

export async function searchPolicies(query: string, limit = 20) {
  const client = getSqlClient();
  const policies = await client`
    SELECT
      id::text,
      policy_number,
      customer_id::text,
      product_type,
      status,
      coverage_amount,
      premium_amount
    FROM policies
    WHERE
      policy_number ILIKE ${"%" + query + "%"} OR
      product_type ILIKE ${"%" + query + "%"}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;

  return policies;
}

export async function createTask(
  advisorId: string,
  taskData: {
    title: string;
    description?: string;
    taskType: string;
    priority: "Low" | "Medium" | "High" | "Urgent";
    status?: string;
    dueDate?: string;
    customerId?: string;
    estimatedHours?: number;
  },
) {
  const client = getSqlClient();

  // Generate task number (format: TSK-YYYY-NNNNNN)
  const year = new Date().getFullYear();
  const taskCount = (await client`
    SELECT COUNT(*)::int as count FROM tasks WHERE task_number LIKE ${`TSK-${year}-%`}
  `) as Array<{ count: number }>;
  const nextNumber = (taskCount[0]?.count || 0) + 1;
  const taskNumber = `TSK-${year}-${String(nextNumber).padStart(6, "0")}`;

  // Insert task
  const taskResult = (await client`
    INSERT INTO tasks (
      task_number,
      title,
      description,
      customer_id,
      advisor_id,
      task_type,
      priority,
      status,
      due_date,
      estimated_hours,
      created_by
    ) VALUES (
      ${taskNumber},
      ${taskData.title},
      ${taskData.description || null},
      ${taskData.customerId || null}::uuid,
      ${advisorId}::uuid,
      ${taskData.taskType},
      ${taskData.priority},
      ${taskData.status || "Open"},
      ${taskData.dueDate || null}::date,
      ${taskData.estimatedHours || null},
      ${advisorId}::uuid
    )
    RETURNING
      id::text,
      task_number,
      advisor_id::text,
      customer_id::text,
      task_type,
      title,
      description,
      priority,
      status,
      due_date,
      estimated_hours,
      created_at
  `) as TaskRow[];

  return taskResult[0];
}

// Communications functions
export async function getAdvisorCommunications(
  advisorId: string,
  limit: number = 50,
): Promise<
  (CommunicationRow & { customer_name?: string; customer_number?: string })[]
> {
  const client = getSqlClient();
  const communications = (await client`
    SELECT
      c.id::text,
      c.communication_number,
      c.customer_id::text,
      c.advisor_id::text,
      c.type,
      c.subject,
      c.content,
      c.status,
      c.sent_at,
      c.delivered_at,
      c.read_at,
      c.template_id::text,
      c.created_at,
      cust.first_name || ' ' || cust.last_name AS customer_name,
      cust.customer_number
    FROM communications c
    LEFT JOIN customers cust ON c.customer_id = cust.id
    WHERE c.advisor_id = ${advisorId}::uuid
    ORDER BY c.sent_at DESC NULLS LAST, c.created_at DESC
    LIMIT ${limit}
  `) as (CommunicationRow & {
    customer_name?: string;
    customer_number?: string;
  })[];
  return communications;
}

export async function getCustomerCommunications(
  customerId: string,
  limit: number = 50,
): Promise<CommunicationRow[]> {
  const client = getSqlClient();
  const communications = (await client`
    SELECT
      c.id::text,
      c.communication_number,
      c.customer_id::text,
      c.advisor_id::text,
      c.type,
      c.subject,
      c.content,
      c.status,
      c.sent_at,
      c.delivered_at,
      c.read_at,
      c.template_id::text,
      c.created_at
    FROM communications c
    WHERE c.customer_id = ${customerId}::uuid
    ORDER BY c.sent_at DESC NULLS LAST, c.created_at DESC
    LIMIT ${limit}
  `) as CommunicationRow[];
  return communications;
}

export async function createCommunication(
  advisorId: string,
  communicationData: {
    customerId: string;
    type: string;
    subject?: string;
    content: string;
    status?: string;
    templateId?: string;
  },
) {
  const client = getSqlClient();

  // Generate communication number (format: COM-YYYY-NNNNNN)
  const year = new Date().getFullYear();
  const commCount = (await client`
    SELECT COUNT(*)::int as count FROM communications WHERE communication_number LIKE ${`COM-${year}-%`}
  `) as Array<{ count: number }>;
  const nextNumber = (commCount[0]?.count || 0) + 1;
  const communicationNumber = `COM-${year}-${String(nextNumber).padStart(6, "0")}`;

  // Insert communication
  const communicationResult = (await client`
    INSERT INTO communications (
      communication_number,
      customer_id,
      advisor_id,
      type,
      subject,
      content,
      status,
      sent_at,
      template_id
    ) VALUES (
      ${communicationNumber},
      ${communicationData.customerId}::uuid,
      ${advisorId}::uuid,
      ${communicationData.type},
      ${communicationData.subject || null},
      ${communicationData.content},
      ${communicationData.status || "Sent"},
      ${communicationData.status === "Sent" ? new Date() : null}::timestamp with time zone,
      ${communicationData.templateId || null}::uuid
    )
    RETURNING
      id::text,
      communication_number,
      customer_id::text,
      advisor_id::text,
      type,
      subject,
      content,
      status,
      sent_at,
      created_at
  `) as CommunicationRow[];

  return communicationResult[0];
}

// Templates functions
export async function getAllTemplates(
  advisorId?: string,
  category?: string,
): Promise<TemplateRow[]> {
  const client = getSqlClient();

  if (advisorId) {
    // Get advisor-specific and global templates
    const templates = (await client`
      SELECT
        id::text,
        template_number,
        name,
        category,
        content,
        advisor_id::text,
        is_global,
        usage_count,
        is_active,
        created_at,
        updated_at
      FROM templates
      WHERE is_active = TRUE
        AND (is_global = TRUE OR advisor_id = ${advisorId}::uuid)
        ${category ? client`AND category = ${category}` : client``}
      ORDER BY is_global DESC, usage_count DESC, name ASC
    `) as TemplateRow[];
    return templates;
  } else {
    // Get only global templates
    const templates = (await client`
      SELECT
        id::text,
        template_number,
        name,
        category,
        content,
        advisor_id::text,
        is_global,
        usage_count,
        is_active,
        created_at,
        updated_at
      FROM templates
      WHERE is_active = TRUE
        AND is_global = TRUE
        ${category ? client`AND category = ${category}` : client``}
      ORDER BY usage_count DESC, name ASC
    `) as TemplateRow[];
    return templates;
  }
}

export async function getTemplateByNumber(
  templateNumber: string,
): Promise<TemplateRow | undefined> {
  const client = getSqlClient();
  const result = (await client`
    SELECT
      id::text,
      template_number,
      name,
      category,
      content,
      advisor_id::text,
      is_global,
      usage_count,
      is_active,
      created_at,
      updated_at
    FROM templates
    WHERE template_number = ${templateNumber}
  `) as TemplateRow[];
  return result[0];
}

export async function createTemplate(
  advisorId: string,
  templateData: {
    name: string;
    category: string;
    content: string;
    isGlobal?: boolean;
  },
) {
  const client = getSqlClient();

  // Generate template number (format: TPL-YYYY-NNNNNN)
  const year = new Date().getFullYear();
  const templateCount = (await client`
    SELECT COUNT(*)::int as count FROM templates WHERE template_number LIKE ${`TPL-${year}-%`}
  `) as Array<{ count: number }>;
  const nextNumber = (templateCount[0]?.count || 0) + 1;
  const templateNumber = `TPL-${year}-${String(nextNumber).padStart(6, "0")}`;

  // Insert template
  const templateResult = (await client`
    INSERT INTO templates (
      template_number,
      name,
      category,
      content,
      advisor_id,
      is_global,
      created_by
    ) VALUES (
      ${templateNumber},
      ${templateData.name},
      ${templateData.category},
      ${templateData.content},
      ${templateData.isGlobal ? null : advisorId}::uuid,
      ${templateData.isGlobal || false},
      ${advisorId}::uuid
    )
    RETURNING
      id::text,
      template_number,
      name,
      category,
      content,
      advisor_id::text,
      is_global,
      usage_count,
      is_active,
      created_at,
      updated_at
  `) as TemplateRow[];

  return templateResult[0];
}

// User Uploaded Documents functions
export async function storeUploadedDocument(params: {
  customerId?: string;
  advisorId?: string;
  conversationId?: string;
  claimId?: string;
  originalFilename: string;
  fileBase64?: string;
  contentType: string;
  extractedText: string;
  category?: string;
  documentType?: string;
  summary?: string;
  keyPoints?: string[];
  metadata?: Record<string, any>;
}): Promise<string> {
  const client = getSqlClient();

  // Generate document number (format: UD-YYYY-NNNNNN)
  const year = new Date().getFullYear();
  const docCount = (await client`
    SELECT COUNT(*)::int as count FROM user_uploaded_documents WHERE document_number LIKE ${`UD-${year}-%`}
  `) as Array<{ count: number }>;
  const nextNumber = (docCount[0]?.count || 0) + 1;
  const documentNumber = `UD-${year}-${String(nextNumber).padStart(6, "0")}`;

  const fileSizeBytes = params.fileBase64
    ? Buffer.from(params.fileBase64, "base64").length
    : null;
  const textPreview = params.extractedText.substring(0, 500);

  const result = (await client`
    INSERT INTO user_uploaded_documents (
      document_number,
      customer_id,
      advisor_id,
      conversation_id,
      claim_id,
      original_filename,
      file_base64,
      file_size_bytes,
      content_type,
      category,
      document_type,
      extracted_text,
      text_preview,
      processing_status,
      metadata
    )
    VALUES (
      ${documentNumber},
      ${params.customerId || null}::uuid,
      ${params.advisorId || null}::uuid,
      ${params.conversationId || null},
      ${params.claimId || null}::uuid,
      ${params.originalFilename},
      ${params.fileBase64 || null},
      ${fileSizeBytes},
      ${params.contentType},
      ${params.category || null},
      ${params.documentType || null},
      ${params.extractedText},
      ${textPreview},
      'completed',
      ${JSON.stringify({
        summary: params.summary,
        keyPoints: params.keyPoints,
        ...(params.metadata || {}),
      })}::jsonb
    )
    RETURNING document_number
  `) as Array<{ document_number: string }>;

  return result[0]?.document_number || documentNumber;
}

export async function getUploadedDocuments(params: {
  customerId?: string;
  advisorId?: string;
  conversationId?: string;
  claimId?: string;
  limit?: number;
}): Promise<
  Array<{
    id: string;
    documentNumber: string;
    originalFilename: string;
    contentType: string;
    category?: string;
    documentType?: string;
    textPreview: string;
    extractedText: string;
    summary?: string;
    keyPoints?: string[];
    createdAt: Date;
  }>
> {
  const client = getSqlClient();

  const result = (await client`
    SELECT
      id::text,
      document_number,
      original_filename,
      content_type,
      category,
      document_type,
      text_preview,
      extracted_text,
      metadata,
      created_at
    FROM user_uploaded_documents
    WHERE 
      (${params.customerId || null}::uuid IS NULL OR customer_id = ${params.customerId}::uuid)
      AND (${params.advisorId || null}::uuid IS NULL OR advisor_id = ${params.advisorId}::uuid)
      AND (${params.conversationId || null} IS NULL OR conversation_id = ${params.conversationId})
      AND (${params.claimId || null}::uuid IS NULL OR claim_id = ${params.claimId}::uuid)
      AND processing_status = 'completed'
    ORDER BY created_at DESC
    LIMIT ${params.limit || 10}
  `) as Array<{
    id: string;
    document_number: string;
    original_filename: string;
    content_type: string;
    category?: string;
    document_type?: string;
    text_preview: string;
    extracted_text: string;
    metadata: any;
    created_at: Date;
  }>;

  return result.map((r) => ({
    id: r.id,
    documentNumber: r.document_number,
    originalFilename: r.original_filename,
    contentType: r.content_type,
    category: r.category || undefined,
    documentType: r.document_type || undefined,
    textPreview: r.text_preview,
    extractedText: r.extracted_text,
    summary: r.metadata?.summary,
    keyPoints: r.metadata?.keyPoints,
    createdAt: r.created_at,
  }));
}

export async function updateUploadedDocumentStatus(
  documentNumber: string,
  status: "pending" | "processing" | "completed" | "failed",
  errorMessage?: string,
): Promise<void> {
  const client = getSqlClient();

  await client`
    UPDATE user_uploaded_documents
    SET 
      processing_status = ${status},
      error_message = ${errorMessage || null},
      updated_at = NOW()
    WHERE document_number = ${documentNumber}
  `;
}

export async function incrementTemplateUsage(templateId: string) {
  const client = getSqlClient();
  await client`
    UPDATE templates
    SET usage_count = usage_count + 1
    WHERE id = ${templateId}::uuid
  `;
}
