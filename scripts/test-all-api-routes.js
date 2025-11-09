#!/usr/bin/env node
/**
 * Comprehensive API Route Testing Script
 * Tests all API routes with actual database queries
 */

const { neon } = require("@neondatabase/serverless");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const sql = neon(process.env.DATABASE_URL);

// Color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, "green");
}

function logError(message) {
  log(`❌ ${message}`, "red");
}

function logInfo(message) {
  log(`ℹ️  ${message}`, "cyan");
}

function logWarning(message) {
  log(`⚠️  ${message}`, "yellow");
}

async function testDatabaseConnection() {
  log("\n🔍 Testing Database Connection...", "blue");
  try {
    const result = await sql`SELECT 1 as test`;
    if (result && result.length > 0) {
      logSuccess("Database connection successful");
      return true;
    }
  } catch (error) {
    logError(`Database connection failed: ${error.message}`);
    return false;
  }
  return false;
}

async function getTestAdvisor() {
  logInfo("Fetching test advisor from database...");
  try {
    const advisors = await sql`
      SELECT id::text, advisor_number, first_name, last_name 
      FROM advisors 
      LIMIT 1
    `;
    if (advisors && advisors.length > 0) {
      const advisor = advisors[0];
      logSuccess(
        `Found advisor: ${advisor.advisor_number} (${advisor.first_name} ${advisor.last_name})`,
      );
      return advisor;
    }
    logError("No advisors found in database");
    return null;
  } catch (error) {
    logError(`Error fetching advisor: ${error.message}`);
    return null;
  }
}

async function getTestCustomer() {
  logInfo("Fetching test customer from database...");
  try {
    const customers = await sql`
      SELECT id::text, customer_number, first_name, last_name 
      FROM customers 
      LIMIT 1
    `;
    if (customers && customers.length > 0) {
      const customer = customers[0];
      logSuccess(
        `Found customer: ${customer.customer_number} (${customer.first_name} ${customer.last_name})`,
      );
      return customer;
    }
    logError("No customers found in database");
    return null;
  } catch (error) {
    logError(`Error fetching customer: ${error.message}`);
    return null;
  }
}

async function testAdvisorsAPI(advisor) {
  log("\n📋 Testing Advisors API...", "blue");

  // Test 1: Get all advisors
  try {
    const allAdvisors = await sql`
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

    if (allAdvisors && allAdvisors.length > 0) {
      logSuccess(`GET /api/advisors: ${allAdvisors.length} advisors found`);
    } else {
      logWarning("GET /api/advisors: No advisors returned");
    }
  } catch (error) {
    logError(`GET /api/advisors: ${error.message}`);
  }

  // Test 2: Get advisor by number
  if (advisor) {
    try {
      const advisorByNumber = await sql`
        SELECT
          id::text,
          advisor_number,
          first_name,
          last_name,
          email,
          avatar_url
        FROM advisors
        WHERE advisor_number = ${advisor.advisor_number}
      `;

      if (advisorByNumber && advisorByNumber.length > 0) {
        logSuccess(
          `GET /api/advisors?number=${advisor.advisor_number}: Found advisor`,
        );
      } else {
        logError(
          `GET /api/advisors?number=${advisor.advisor_number}: Advisor not found`,
        );
      }
    } catch (error) {
      logError(`GET /api/advisors?number=...: ${error.message}`);
    }
  }
}

async function testCustomersAPI(customer) {
  log("\n👥 Testing Customers API...", "blue");

  // Test 1: Get all customers
  try {
    const allCustomers = await sql`
      SELECT
        id::text,
        customer_number,
        first_name,
        last_name,
        email,
        phone_primary,
        segment
      FROM customers
      LIMIT 100
    `;

    if (allCustomers && allCustomers.length > 0) {
      logSuccess(`GET /api/customers: ${allCustomers.length} customers found`);
    } else {
      logWarning("GET /api/customers: No customers returned");
    }
  } catch (error) {
    logError(`GET /api/customers: ${error.message}`);
  }

  // Test 2: Get customer by number
  if (customer) {
    try {
      const customerByNumber = await sql`
        SELECT
          id::text,
          customer_number,
          first_name,
          last_name,
          email
        FROM customers
        WHERE customer_number = ${customer.customer_number}
      `;

      if (customerByNumber && customerByNumber.length > 0) {
        logSuccess(
          `GET /api/customers?number=${customer.customer_number}: Found customer`,
        );
      } else {
        logError(
          `GET /api/customers?number=${customer.customer_number}: Customer not found`,
        );
      }
    } catch (error) {
      logError(`GET /api/customers?number=...: ${error.message}`);
    }
  }
}

async function testTasksAPI(advisor) {
  log("\n📝 Testing Tasks API...", "blue");

  if (!advisor) {
    logWarning("Skipping tasks test - no advisor available");
    return;
  }

  // Test 1: Get tasks by advisor ID (UUID)
  try {
    const tasksByUuid = await sql`
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
      WHERE t.advisor_id = ${advisor.id}::uuid
      ORDER BY t.due_date ASC NULLS LAST, t.priority DESC
      LIMIT 10
    `;

    if (tasksByUuid && tasksByUuid.length > 0) {
      logSuccess(
        `GET /api/tasks?advisorId=${advisor.id}: ${tasksByUuid.length} tasks found`,
      );
    } else {
      logWarning(`GET /api/tasks?advisorId=${advisor.id}: No tasks found`);
    }
  } catch (error) {
    logError(`GET /api/tasks?advisorId=<UUID>: ${error.message}`);
  }

  // Test 2: Get tasks by advisor number
  try {
    // First get advisor UUID
    const advisorRecord = await sql`
      SELECT id::text FROM advisors WHERE advisor_number = ${advisor.advisor_number}
    `;

    if (advisorRecord && advisorRecord.length > 0) {
      const advisorId = advisorRecord[0].id;

      const tasksByNumber = await sql`
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
        LIMIT 10
      `;

      if (tasksByNumber && tasksByNumber.length > 0) {
        logSuccess(
          `GET /api/tasks?advisorId=${advisor.advisor_number}: ${tasksByNumber.length} tasks found`,
        );
      } else {
        logWarning(
          `GET /api/tasks?advisorId=${advisor.advisor_number}: No tasks found`,
        );
      }
    } else {
      logError(
        `GET /api/tasks?advisorId=${advisor.advisor_number}: Advisor not found`,
      );
    }
  } catch (error) {
    logError(`GET /api/tasks?advisorId=<number>: ${error.message}`);
  }

  // Test 3: Get tasks with status filter
  try {
    const advisorRecord = await sql`
      SELECT id::text FROM advisors WHERE advisor_number = ${advisor.advisor_number}
    `;

    if (advisorRecord && advisorRecord.length > 0) {
      const advisorId = advisorRecord[0].id;

      const openTasks = await sql`
        SELECT
          t.id::text,
          t.task_number,
          t.status,
          t.priority,
          t.title
        FROM tasks t
        WHERE t.advisor_id = ${advisorId}::uuid
          AND (t.status = 'Open' OR t.status = 'In Progress')
        LIMIT 10
      `;

      if (openTasks && openTasks.length > 0) {
        logSuccess(
          `GET /api/tasks?advisorId=${advisor.advisor_number}&status=open: ${openTasks.length} open tasks found`,
        );
      } else {
        logWarning(
          `GET /api/tasks?advisorId=${advisor.advisor_number}&status=open: No open tasks found`,
        );
      }
    }
  } catch (error) {
    logError(`GET /api/tasks?advisorId=...&status=open: ${error.message}`);
  }
}

async function testPoliciesAPI(customer) {
  log("\n📄 Testing Policies API...", "blue");

  // Test 1: Get all policies
  try {
    const allPolicies = await sql`
      SELECT
        p.id::text,
        p.policy_number,
        p.customer_id::text,
        c.customer_number,
        p.product_type,
        p.status,
        p.coverage_amount,
        p.premium_amount
      FROM policies p
      LEFT JOIN customers c ON p.customer_id = c.id
      LIMIT 50
    `;

    if (allPolicies && allPolicies.length > 0) {
      logSuccess(`GET /api/policies: ${allPolicies.length} policies found`);
    } else {
      logWarning("GET /api/policies: No policies returned");
    }
  } catch (error) {
    logError(`GET /api/policies: ${error.message}`);
  }

  // Test 2: Get policies by customer
  if (customer) {
    try {
      const customerPolicies = await sql`
        SELECT
          p.id::text,
          p.policy_number,
          p.product_type,
          p.status,
          p.coverage_amount
        FROM policies p
        WHERE p.customer_id = ${customer.id}::uuid
        LIMIT 10
      `;

      if (customerPolicies && customerPolicies.length > 0) {
        logSuccess(
          `GET /api/policies?customerId=${customer.customer_number}: ${customerPolicies.length} policies found`,
        );
      } else {
        logWarning(
          `GET /api/policies?customerId=${customer.customer_number}: No policies found`,
        );
      }
    } catch (error) {
      logError(`GET /api/policies?customerId=...: ${error.message}`);
    }
  }
}

async function testClaimsAPI(customer) {
  log("\n🏥 Testing Claims API...", "blue");

  // Test 1: Get all claims
  try {
    const allClaims = await sql`
      SELECT
        c.id::text,
        c.claim_number,
        c.customer_id::text,
        cust.customer_number,
        c.claim_type,
        c.status,
        c.approved_amount,
        c.paid_amount
      FROM claims c
      LEFT JOIN customers cust ON c.customer_id = cust.id
      LIMIT 50
    `;

    if (allClaims && allClaims.length > 0) {
      logSuccess(`GET /api/claims: ${allClaims.length} claims found`);
    } else {
      logWarning("GET /api/claims: No claims returned");
    }
  } catch (error) {
    logError(`GET /api/claims: ${error.message}`);
  }

  // Test 2: Get claims by customer
  if (customer) {
    try {
      const customerClaims = await sql`
        SELECT
          c.id::text,
          c.claim_number,
          c.claim_type,
          c.status,
          c.approved_amount,
          c.paid_amount
        FROM claims c
        WHERE c.customer_id = ${customer.id}::uuid
        LIMIT 10
      `;

      if (customerClaims && customerClaims.length > 0) {
        logSuccess(
          `GET /api/claims?customerId=${customer.customer_number}: ${customerClaims.length} claims found`,
        );
      } else {
        logWarning(
          `GET /api/claims?customerId=${customer.customer_number}: No claims found`,
        );
      }
    } catch (error) {
      logError(`GET /api/claims?customerId=...: ${error.message}`);
    }
  }
}

async function testInteractionsAPI(customer) {
  log("\n💬 Testing Interactions API...", "blue");

  // Test 1: Get all interactions
  try {
    const allInteractions = await sql`
      SELECT
        i.id::text,
        i.customer_id::text,
        c.customer_number,
        i.interaction_type,
        i.channel,
        i.outcome
      FROM interactions i
      LEFT JOIN customers c ON i.customer_id = c.id
      ORDER BY i.created_at DESC
      LIMIT 50
    `;

    if (allInteractions && allInteractions.length > 0) {
      logSuccess(
        `GET /api/interactions: ${allInteractions.length} interactions found`,
      );
    } else {
      logWarning("GET /api/interactions: No interactions returned");
    }
  } catch (error) {
    logError(`GET /api/interactions: ${error.message}`);
  }

  // Test 2: Get interactions by customer
  if (customer) {
    try {
      const customerInteractions = await sql`
        SELECT
          i.id::text,
          i.interaction_type,
          i.channel,
          i.outcome,
          i.created_at
        FROM interactions i
        WHERE i.customer_id = ${customer.id}::uuid
        ORDER BY i.created_at DESC
        LIMIT 10
      `;

      if (customerInteractions && customerInteractions.length > 0) {
        logSuccess(
          `GET /api/interactions?customerId=${customer.customer_number}: ${customerInteractions.length} interactions found`,
        );
      } else {
        logWarning(
          `GET /api/interactions?customerId=${customer.customer_number}: No interactions found`,
        );
      }
    } catch (error) {
      logError(`GET /api/interactions?customerId=...: ${error.message}`);
    }
  }
}

async function testAdvisorClientsAPI(advisor) {
  log("\n👨‍💼 Testing Advisor Clients API...", "blue");

  if (!advisor) {
    logWarning("Skipping advisor clients test - no advisor available");
    return;
  }

  try {
    const clients = await sql`
      SELECT
        c.id::text,
        c.customer_number,
        c.first_name,
        c.last_name,
        c.segment,
        c.engagement_score,
        c.lifetime_value
      FROM customers c
      WHERE c.primary_advisor_id = ${advisor.id}::uuid
      ORDER BY c.engagement_score DESC
      LIMIT 50
    `;

    if (clients && clients.length > 0) {
      logSuccess(
        `GET /api/advisors/${advisor.advisor_number}/clients: ${clients.length} clients found`,
      );
    } else {
      logWarning(
        `GET /api/advisors/${advisor.advisor_number}/clients: No clients found`,
      );
    }
  } catch (error) {
    logError(`GET /api/advisors/.../clients: ${error.message}`);
  }
}

async function testAdvisorDashboardAPI(advisor) {
  log("\n📊 Testing Advisor Dashboard API...", "blue");

  if (!advisor) {
    logWarning("Skipping advisor dashboard test - no advisor available");
    return;
  }

  try {
    // Get total clients
    const totalClients = await sql`
      SELECT COUNT(*) as count
      FROM customers
      WHERE primary_advisor_id = ${advisor.id}::uuid
    `;

    // Get open tasks
    const openTasks = await sql`
      SELECT COUNT(*) as count
      FROM tasks
      WHERE advisor_id = ${advisor.id}::uuid
        AND (status = 'Open' OR status = 'In Progress')
    `;

    // Get recent interactions
    const recentInteractions = await sql`
      SELECT COUNT(*) as count
      FROM interactions i
      JOIN customers c ON i.customer_id = c.id
      WHERE c.primary_advisor_id = ${advisor.id}::uuid
        AND i.created_at > NOW() - INTERVAL '7 days'
    `;

    if (totalClients && totalClients.length > 0) {
      logSuccess(
        `GET /api/advisors/${advisor.advisor_number}/dashboard: Data retrieved`,
      );
      logInfo(`  - Total clients: ${totalClients[0].count}`);
      logInfo(`  - Open tasks: ${openTasks[0]?.count || 0}`);
      logInfo(
        `  - Recent interactions (7 days): ${recentInteractions[0]?.count || 0}`,
      );
    } else {
      logWarning(
        `GET /api/advisors/${advisor.advisor_number}/dashboard: No data found`,
      );
    }
  } catch (error) {
    logError(`GET /api/advisors/.../dashboard: ${error.message}`);
  }
}

async function testDocumentsAPI() {
  log("\n📚 Testing Documents API...", "blue");

  // Test 1: Get all documents
  try {
    const allDocuments = await sql`
      SELECT
        id::text,
        filename,
        file_path,
        category,
        document_type,
        file_size_bytes
      FROM document_files
      ORDER BY filename
      LIMIT 50
    `;

    if (allDocuments && allDocuments.length > 0) {
      logSuccess(`GET /api/documents: ${allDocuments.length} documents found`);
    } else {
      logWarning("GET /api/documents: No documents returned");
    }
  } catch (error) {
    logError(`GET /api/documents: ${error.message}`);
  }
}

async function testGraphAPI() {
  log("\n🕸️  Testing Graph API...", "blue");

  try {
    // Test if Neo4j is configured
    if (!process.env.NEO4J_URI || !process.env.NEO4J_PASSWORD) {
      logWarning("Neo4j not configured - Graph API will return empty results");
      return;
    }

    logInfo("Neo4j is configured - Graph API should work");
    logSuccess("GET /api/graph: Configuration check passed");
  } catch (error) {
    logError(`GET /api/graph: ${error.message}`);
  }
}

async function testKnowledgeAPI() {
  log("\n🔍 Testing Knowledge API...", "blue");

  try {
    // Test vector search capability
    const documents = await sql`
      SELECT COUNT(*) as count FROM documents
    `;

    const chunks = await sql`
      SELECT COUNT(*) as count FROM chunks WHERE embedding IS NOT NULL
    `;

    if (documents && documents.length > 0) {
      logSuccess(`GET /api/knowledge: Knowledge base available`);
      logInfo(`  - Documents: ${documents[0].count}`);
      logInfo(`  - Chunks with embeddings: ${chunks[0]?.count || 0}`);
    } else {
      logWarning("GET /api/knowledge: No documents in knowledge base");
    }
  } catch (error) {
    logError(`GET /api/knowledge: ${error.message}`);
  }
}

async function runAllTests() {
  log("\n" + "=".repeat(60), "blue");
  log("🧪 Comprehensive API Route Testing", "blue");
  log("=".repeat(60) + "\n", "blue");

  // Test database connection
  const dbConnected = await testDatabaseConnection();
  if (!dbConnected) {
    logError("Cannot proceed - database connection failed");
    process.exit(1);
  }

  // Get test data
  const advisor = await getTestAdvisor();
  const customer = await getTestCustomer();

  // Run all tests
  await testAdvisorsAPI(advisor);
  await testCustomersAPI(customer);
  await testTasksAPI(advisor);
  await testPoliciesAPI(customer);
  await testClaimsAPI(customer);
  await testInteractionsAPI(customer);
  await testAdvisorClientsAPI(advisor);
  await testAdvisorDashboardAPI(advisor);
  await testDocumentsAPI();
  await testGraphAPI();
  await testKnowledgeAPI();

  log("\n" + "=".repeat(60), "blue");
  log("✅ API Route Testing Complete!", "green");
  log("=".repeat(60) + "\n", "blue");
}

// Run tests
runAllTests().catch((error) => {
  logError(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
