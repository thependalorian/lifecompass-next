// lib/db/neon.ts

import { neon } from "@neondatabase/serverless";
import { Message, Session } from "@/lib/agent/models";

// Lazy initialization of neon client
let sqlClient: any = null;

// Helper function to get sql client with error handling
function getSqlClient() {
  if (!sqlClient) {
    if (!process.env.DATABASE_URL) {
      throw new Error("Database not configured");
    }
    sqlClient = neon(process.env.DATABASE_URL);
  }
  return sqlClient;
}

// Session management
export async function createSession(userId?: string): Promise<string> {
  const client = getSqlClient();
  const result = await client`
    INSERT INTO sessions (user_id, metadata, expires_at)
    VALUES (${userId}, '{}', NOW() + INTERVAL '24 hours')
    RETURNING id::text
  `;
  return result[0].id;
}

export async function getSession(sessionId: string): Promise<Session | null> {
  const client = getSqlClient();
  const [session] = await client`
    SELECT
      id::text,
      user_id,
      metadata,
      created_at,
      updated_at,
      expires_at
    FROM sessions
    WHERE id = ${sessionId}::uuid AND expires_at > NOW()
  `;

  if (!session) return null;

  return {
    id: session.id,
    userId: session.user_id,
    metadata: session.metadata,
    createdAt: new Date(session.created_at),
    updatedAt: new Date(session.updated_at),
    expiresAt: new Date(session.expires_at),
  };
}

export async function updateSession(
  sessionId: string,
  metadata: Record<string, any>,
) {
  const client = getSqlClient();
  await client`
    UPDATE sessions
    SET metadata = ${JSON.stringify(metadata)}, updated_at = NOW()
    WHERE id = ${sessionId}::uuid
  `;
}

// Message management
export async function addMessage(
  sessionId: string,
  role: string,
  content: string,
  metadata?: Record<string, any>,
): Promise<string> {
  const client = getSqlClient();
  const result = await client`
    INSERT INTO messages (session_id, role, content, metadata)
    VALUES (${sessionId}::uuid, ${role}, ${content}, ${JSON.stringify(metadata || {})})
    RETURNING id::text
  `;
  return result[0].id;
}

export async function getSessionMessages(
  sessionId: string,
  limit = 50,
): Promise<Array<{ role: string; content: string }>> {
  const client = getSqlClient();
  const messages = await client`
    SELECT role, content
    FROM messages
    WHERE session_id = ${sessionId}::uuid
    ORDER BY created_at ASC
    LIMIT ${limit}
  `;

  return messages.map((msg: any) => ({
    role: msg.role,
    content: msg.content,
  }));
}

// Customer data access
export async function getCustomerById(customerId: string) {
  const client = getSqlClient();
  const [customer] = await client`
    SELECT
      id::text,
      customer_number,
      first_name,
      last_name,
      email,
      phone_primary,
      phone_secondary,
      date_of_birth,
      address_city,
      address_region,
      occupation,
      monthly_income,
      segment,
      lifetime_value,
      engagement_score,
      primary_advisor_id::text
    FROM customers
    WHERE id = ${customerId}::uuid
  `;

  return customer;
}

export async function getCustomerPolicies(customerId: string) {
  const client = getSqlClient();
  const policies = await client`
    SELECT
      id::text,
      policy_number,
      product_type,
      product_subtype,
      status,
      coverage_amount,
      premium_amount,
      start_date,
      end_date,
      renewal_date
    FROM policies
    WHERE customer_id = ${customerId}::uuid
    ORDER BY created_at DESC
  `;

  return policies;
}

export async function getCustomerClaims(customerId: string) {
  const client = getSqlClient();
  const claims = await client`
    SELECT
      id::text,
      claim_number,
      policy_id::text,
      customer_id::text,
      claim_type,
      status,
      incident_date,
      approved_amount,
      paid_amount,
      processing_time_days
    FROM claims
    WHERE customer_id = ${customerId}::uuid
    ORDER BY created_at DESC
  `;

  return claims;
}

export async function getAllClaims(limit = 100) {
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
      c.approved_amount,
      c.paid_amount,
      c.processing_time_days
    FROM claims c
    LEFT JOIN customers cust ON c.customer_id = cust.id
    ORDER BY c.created_at DESC
    LIMIT ${limit}
  `;

  return claims;
}

// Advisor data access
export async function getAdvisorById(advisorId: string) {
  const client = getSqlClient();
  const [advisor] = await client`
    SELECT
      id::text,
      advisor_number,
      first_name,
      last_name,
      email,
      specialization,
      experience_years,
      region,
      active_clients,
      monthly_target,
      monthly_sales,
      conversion_rate,
      satisfaction_score,
      performance_rating,
      avatar_url
    FROM advisors
    WHERE id = ${advisorId}::uuid
  `;

  return advisor;
}

export async function getAdvisorClients(advisorId: string, limit = 50) {
  const client = getSqlClient();
  const clients = await client`
    SELECT
      c.id::text,
      c.customer_number,
      c.first_name,
      c.last_name,
      c.segment,
      c.engagement_score,
      c.lifetime_value
    FROM customers c
    WHERE c.primary_advisor_id = ${advisorId}::uuid
    ORDER BY c.engagement_score DESC
    LIMIT ${limit}
  `;

  return clients;
}

export async function getAllAdvisors() {
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
      avatar_url
    FROM advisors
    ORDER BY advisor_number
  `;

  return advisors;
}

export async function getAdvisorByNumber(advisorNumber: string) {
  const client = getSqlClient();
  const [advisor] = await client`
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
      avatar_url
    FROM advisors
    WHERE advisor_number = ${advisorNumber}
  `;

  return advisor;
}

export async function getAllCustomers() {
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
      address_street,
      address_city,
      address_region,
      occupation,
      monthly_income,
      marital_status,
      dependents_count,
      segment,
      digital_adoption_level,
      preferred_language,
      preferred_contact_method
    FROM customers
    ORDER BY customer_number
  `;

  return customers;
}

export async function getCustomerByNumber(customerNumber: string) {
  const client = getSqlClient();
  const [customer] = await client`
    SELECT
      id::text,
      customer_number,
      first_name,
      last_name,
      email,
      phone_primary,
      phone_secondary,
      date_of_birth,
      address_street,
      address_city,
      address_region,
      occupation,
      monthly_income,
      marital_status,
      dependents_count,
      segment,
      digital_adoption_level,
      preferred_language,
      preferred_contact_method,
      engagement_score,
      lifetime_value,
      churn_risk
    FROM customers
    WHERE customer_number = ${customerNumber}
  `;

  return customer;
}

export async function getAdvisorTasks(
  advisorId: string,
  status?: "open" | "completed" | "cancelled" | "in_progress",
  priority?: "high" | "medium" | "low" | "urgent"
) {
  const client = getSqlClient();
  
  // Map lowercase API values to database values (case-insensitive)
  const statusMap: Record<string, string[]> = {
    "open": ["Open"], // "open" matches only "Open" status
    "in_progress": ["In Progress"], // "in_progress" matches "In Progress" status
    "completed": ["Completed"],
    "cancelled": ["Cancelled"],
  };
  
  const priorityMap: Record<string, string> = {
    "low": "Low",
    "medium": "Medium",
    "high": "High",
    "urgent": "Urgent",
  };
  
  // Convert status to database format
  const dbStatuses = status ? statusMap[status.toLowerCase()] || [] : null;
  const dbPriority = priority ? priorityMap[priority.toLowerCase()] : null;
  
  // Build query with proper parameterization
  if (dbStatuses && dbStatuses.length > 0 && dbPriority) {
    // Build status condition - handle single element array
    const statusValue = dbStatuses[0];
    const tasks = await client`
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
    `;
    return tasks;
  } else if (dbStatuses && dbStatuses.length > 0) {
    // Build status condition - handle single element array
    const statusValue = dbStatuses[0];
    const tasks = await client`
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
    `;
    return tasks;
  } else if (dbPriority) {
    const tasks = await client`
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
    `;
    return tasks;
  } else {
    const tasks = await client`
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
    `;
    return tasks;
  }
}

export async function getCustomerInteractions(
  customerId: string,
  limit: number = 10
) {
  const client = getSqlClient();
  const interactions = await client`
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
      created_at
    FROM interactions
    WHERE customer_id = ${customerId}::uuid
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  
  return interactions;
}

export async function getAllDocuments(category?: string, documentType?: string) {
  const client = getSqlClient();
  
  if (category && documentType) {
    const documents = await client`
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
    `;
    return documents;
  } else if (category) {
    const documents = await client`
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
    `;
    return documents;
  } else if (documentType) {
    const documents = await client`
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
    `;
    return documents;
  } else {
    const documents = await client`
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
    `;
    return documents;
  }
}

export async function getDocumentByNumber(documentNumber: string) {
  const client = getSqlClient();
  const [document] = await client`
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
  `;

  return document;
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
  }
) {
  const client = getSqlClient();
  
  // Generate task number (format: TSK-YYYY-NNNNNN)
  const year = new Date().getFullYear();
  const taskCount = await client`
    SELECT COUNT(*)::int as count FROM tasks WHERE task_number LIKE ${`TSK-${year}-%`}
  `;
  const nextNumber = (taskCount[0]?.count || 0) + 1;
  const taskNumber = `TSK-${year}-${String(nextNumber).padStart(6, "0")}`;
  
  // Insert task
  const [task] = await client`
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
  `;
  
  return task;
}
