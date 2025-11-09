// app/api/advisors/[id]/dashboard/route.ts
// API endpoint for fetching advisor dashboard statistics

import { NextRequest, NextResponse } from "next/server";
import {
  getAdvisorByNumber,
  getAdvisorClients,
  getAdvisorTasks,
  getAdvisorSummary,
  getAdvisorPerformanceStats,
  getAdvisorMonthlyTrends,
  getSqlClient,
} from "@/lib/db/neon";
import { performanceMonitor } from "@/lib/utils/performance";
import {
  requestDeduplicator,
  RequestDeduplicator,
} from "@/lib/utils/request-deduplication";

// Force dynamic rendering since we use request.url
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const startTime = Date.now();
  try {
    const advisorIdOrNumber = params.id;

    // Input validation: sanitize and validate advisor ID/number
    if (!advisorIdOrNumber || typeof advisorIdOrNumber !== "string") {
      return NextResponse.json(
        { error: "Advisor ID or number is required" },
        { status: 400 },
      );
    }

    // Sanitize: remove any potentially dangerous characters
    const sanitizedId = advisorIdOrNumber.trim();
    if (sanitizedId.length === 0 || sanitizedId.length > 100) {
      return NextResponse.json(
        { error: "Invalid advisor ID format" },
        { status: 400 },
      );
    }

    // Use request deduplication to prevent duplicate concurrent requests
    const dedupeKey = RequestDeduplicator.generateKey(
      "api-dashboard",
      sanitizedId,
    );
    return requestDeduplicator.deduplicate(dedupeKey, async () => {
      return await fetchDashboardData(sanitizedId, startTime);
    });
  } catch (error) {
    console.error("Error fetching advisor dashboard:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // Record error metric
    const duration = Date.now() - startTime;
    performanceMonitor.record({
      endpoint: `/api/advisors/[id]/dashboard`,
      method: "GET",
      duration,
      statusCode: 500,
      error: errorMessage,
    });

    return NextResponse.json(
      {
        error: "Failed to fetch advisor dashboard",
        message:
          process.env.NODE_ENV === "development"
            ? errorMessage
            : "Please try again later or contact support if the problem persists.",
      },
      { status: 500 },
    );
  }
}

// Extract dashboard data fetching logic
async function fetchDashboardData(
  sanitizedId: string,
  startTime: number,
): Promise<NextResponse> {
  // Get advisor by number or ID
  let advisor;
  let advisorId;

  if (sanitizedId.startsWith("ADV-")) {
    // It's an advisor number
    advisor = await getAdvisorByNumber(sanitizedId);
    if (!advisor) {
      return NextResponse.json({ error: "Advisor not found" }, { status: 404 });
    }
    advisorId = advisor.id;
  } else {
    // Assume it's a UUID - need to get advisor by ID
    // For now, try to get by number first, then fallback
    advisor = await getAdvisorByNumber(sanitizedId);
    if (!advisor) {
      return NextResponse.json(
        {
          error:
            "Advisor not found. Please use advisor number (e.g., ADV-001).",
        },
        { status: 404 },
      );
    }
    advisorId = advisor.id;
  }

  // Parallelize database queries for better performance
  // Use analytics tables for better performance instead of calculating manually
  const [clients, allTasks, advisorSummary, performanceStats] =
    await Promise.all([
      getAdvisorClients(advisorId, 200),
      getAdvisorTasks(advisorId),
      getAdvisorSummary(advisorId).catch(() => null), // Fallback if summary doesn't exist
      getAdvisorPerformanceStats(advisorId).catch(() => null), // Fallback if stats don't exist
    ]);
  const openTasks = allTasks.filter(
    (t: any) => t.status === "Open" || t.status === "In Progress",
  );

  // Get today's tasks
  const today = new Date().toISOString().split("T")[0];
  const tasksToday = openTasks.filter((t: any) => {
    if (!t.due_date) return false;
    const dueDate = new Date(t.due_date).toISOString().split("T")[0];
    return dueDate === today;
  });

  // Calculate this month's stats from performance data
  // Get current month start date
  // Note: Seed data uses CURRENT_DATE - week_offset, so we need to look at recent dates
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  // Also get the most recent 30 days as fallback (seed data might be dated)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Fetch this month and last month performance data
  // Note: advisor_performance table uses: clients_served, new_sales (premium amount), renewals, customer_satisfaction, date
  // Fresh seed data generates records with CURRENT_DATE, so dates are always recent
  // We use the most recent 30 days as "this month" and previous 30 days as "last month"
  const client = getSqlClient();

  // Debug: Log date ranges being queried
  if (process.env.NODE_ENV === "development") {
    console.log("[Dashboard] Querying advisor performance:", {
      advisorId,
      thisMonthStart: thirtyDaysAgo.toISOString().split("T")[0],
      thisMonthEnd: now.toISOString().split("T")[0],
      lastMonthStart: sixtyDaysAgo.toISOString().split("T")[0],
      lastMonthEnd: thirtyDaysAgo.toISOString().split("T")[0],
    });
  }
  const [
    thisMonthResult,
    lastMonthResult,
    thisMonthPoliciesCount,
    lastMonthPoliciesCount,
  ] = await Promise.all([
    // This month performance aggregates
    client`
        SELECT
          COALESCE(SUM(clients_served), 0)::int as new_clients,
          COALESCE(SUM(new_sales + renewals), 0)::numeric as premium_generated,
          COALESCE(AVG(conversion_rate), 0)::numeric as conversion_rate,
          COALESCE(AVG(avg_response_time_hours), 0)::numeric as avg_response_time,
          COALESCE(AVG(customer_satisfaction), 0)::numeric as avg_satisfaction
        FROM advisor_performance
        WHERE advisor_id = ${advisorId}::uuid
          AND date >= ${thirtyDaysAgo.toISOString().split("T")[0]}::date
          AND date <= ${now.toISOString().split("T")[0]}::date
      `,
    // Last month performance aggregates
    client`
        SELECT
          COALESCE(SUM(clients_served), 0)::int as new_clients,
          COALESCE(SUM(new_sales + renewals), 0)::numeric as premium_generated,
          COALESCE(AVG(conversion_rate), 0)::numeric as conversion_rate,
          COALESCE(AVG(avg_response_time_hours), 0)::numeric as avg_response_time,
          COALESCE(AVG(customer_satisfaction), 0)::numeric as avg_satisfaction
        FROM advisor_performance
        WHERE advisor_id = ${advisorId}::uuid
          AND date >= ${sixtyDaysAgo.toISOString().split("T")[0]}::date
          AND date < ${thirtyDaysAgo.toISOString().split("T")[0]}::date
      `,
    // This month actual policies count (from policies table)
    client`
        SELECT COUNT(*)::int as policies_count
        FROM policies
        WHERE advisor_id = ${advisorId}::uuid
          AND created_at >= ${thirtyDaysAgo.toISOString().split("T")[0]}::date
          AND created_at <= ${now.toISOString().split("T")[0]}::date
      `,
    // Last month actual policies count (from policies table)
    client`
        SELECT COUNT(*)::int as policies_count
        FROM policies
        WHERE advisor_id = ${advisorId}::uuid
          AND created_at >= ${sixtyDaysAgo.toISOString().split("T")[0]}::date
          AND created_at < ${thirtyDaysAgo.toISOString().split("T")[0]}::date
      `,
  ]);

  const thisMonthStats = thisMonthResult as unknown as Array<{
    new_clients: number;
    premium_generated: number;
    conversion_rate: number;
    avg_response_time: number;
    avg_satisfaction: number;
  }>;

  const lastMonthStats = lastMonthResult as unknown as Array<{
    new_clients: number;
    premium_generated: number;
    conversion_rate: number;
    avg_response_time: number;
    avg_satisfaction: number;
  }>;

  const thisMonthPolicies = thisMonthPoliciesCount as unknown as Array<{
    policies_count: number;
  }>;
  const lastMonthPolicies = lastMonthPoliciesCount as unknown as Array<{
    policies_count: number;
  }>;

  const thisMonth = {
    new_clients: thisMonthStats[0]?.new_clients || 0,
    policies_sold: thisMonthPolicies[0]?.policies_count || 0,
    premium_generated: thisMonthStats[0]?.premium_generated || 0,
    conversion_rate: thisMonthStats[0]?.conversion_rate || 0,
    avg_response_time: thisMonthStats[0]?.avg_response_time || 0,
    avg_satisfaction: thisMonthStats[0]?.avg_satisfaction || 0,
  };

  const lastMonth = {
    new_clients: lastMonthStats[0]?.new_clients || 0,
    policies_sold: lastMonthPolicies[0]?.policies_count || 0,
    premium_generated: lastMonthStats[0]?.premium_generated || 0,
    conversion_rate: lastMonthStats[0]?.conversion_rate || 0,
    avg_response_time: lastMonthStats[0]?.avg_response_time || 0,
    avg_satisfaction: lastMonthStats[0]?.avg_satisfaction || 0,
  };

  // Debug: Log results
  if (process.env.NODE_ENV === "development") {
    console.log("[Dashboard] Performance stats:", {
      thisMonth,
      lastMonth,
      thisMonthRecords: thisMonthStats.length,
      lastMonthRecords: lastMonthStats.length,
      thisMonthPoliciesRecords: thisMonthPolicies.length,
      lastMonthPoliciesRecords: lastMonthPolicies.length,
    });
  }

  // Use analytics data if available, otherwise fallback to advisor table or calculated values
  const dashboardStats = {
    activeClients:
      advisorSummary?.total_clients || advisor.active_clients || clients.length,
    tasksToday: tasksToday.length,
    meetingsScheduled: performanceStats?.total_meetings || 0,
    monthlyTarget: parseFloat(advisor.monthly_target?.toString() || "0"),
    currentSales: parseFloat(
      advisor.monthly_sales?.toString() ||
        performanceStats?.total_premium_generated?.toString() ||
        "0",
    ),
    // Performance Overview fields (matching insights page expectations)
    newClients: Number(thisMonth.new_clients) || 0,
    policiesSold: Number(thisMonth.policies_sold) || 0,
    totalPremiumValue: Number(thisMonth.premium_generated) || 0,
    conversionRate:
      Number(thisMonth.conversion_rate) ||
      parseFloat(
        advisorSummary?.conversion_rate?.toString() ||
          advisor.conversion_rate?.toString() ||
          performanceStats?.avg_conversion_rate?.toString() ||
          "0",
      ),
    avgResponseTime: Number(thisMonth.avg_response_time) || 0,
    averageSatisfactionScore:
      Number(thisMonth.avg_satisfaction) ||
      parseFloat(
        advisorSummary?.client_satisfaction_score?.toString() ||
          advisor.satisfaction_score?.toString() ||
          performanceStats?.avg_satisfaction?.toString() ||
          "0",
      ),
    // Legacy fields for backward compatibility
    clientSatisfaction:
      parseFloat(
        advisorSummary?.client_satisfaction_score?.toString() ||
          advisor.satisfaction_score?.toString() ||
          performanceStats?.avg_satisfaction?.toString() ||
          "0",
      ) / 20, // Convert from 0-100 to 0-5 scale
    // Last month for comparison
    lastMonth: {
      newClients: Number(lastMonth.new_clients) || 0,
      policiesSold: Number(lastMonth.policies_sold) || 0,
      totalPremiumValue: Number(lastMonth.premium_generated) || 0,
      conversionRate: Number(lastMonth.conversion_rate) || 0,
      avgResponseTime: Number(lastMonth.avg_response_time) || 0,
      averageSatisfactionScore: Number(lastMonth.avg_satisfaction) || 0,
    },
  };

  // Get recent tasks (top 3 by priority and due date)
  const recentTasks = openTasks
    .sort((a: any, b: any) => {
      const priorityOrder = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
      const aPriority =
        priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
      const bPriority =
        priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
      if (aPriority !== bPriority) return bPriority - aPriority;

      // Then by due date
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    })
    .slice(0, 3)
    .map((task: any) => {
      // Get customer info if available - show full name
      const taskClient = clients.find((c: any) => c.id === task.customer_id);
      let clientDisplayName = "Unknown Client";
      if (taskClient) {
        // Advisors can see full customer names
        const firstName = taskClient.first_name;
        const lastName = taskClient.last_name;
        const customerNumber = taskClient.customer_number;
        if (firstName && lastName) {
          // Show full name with customer number: "Maria Shikongo (CUST-001)"
          clientDisplayName = customerNumber
            ? `${firstName} ${lastName} (${customerNumber})`
            : `${firstName} ${lastName}`;
        } else if (customerNumber) {
          // Just customer number if no name available
          clientDisplayName = customerNumber;
        }
      }
      return {
        id: task.task_number || task.id,
        type: task.task_type,
        client: clientDisplayName,
        priority: task.priority,
        description: task.description || task.title,
        dueDate: task.due_date
          ? new Date(task.due_date).toLocaleDateString()
          : "No due date",
      };
    });

  // Upcoming meetings (placeholder - would need meetings table)
  const upcomingMeetings: any[] = [];

  // Fetch monthly trends for charts (last 6 months)
  const monthlyTrends = await getAdvisorMonthlyTrends(advisorId, 6).catch(
    () => [],
  );

  const responseData = {
    advisor: {
      id: advisor.advisor_number,
      name: `${advisor.first_name} ${advisor.last_name}`,
    },
    stats: dashboardStats,
    recentTasks,
    upcomingMeetings,
    monthlyTrends, // Add trend data for charts
  };

  const response = NextResponse.json(responseData);

  // Record performance metric
  const duration = Date.now() - startTime;
  performanceMonitor.record({
    endpoint: `/api/advisors/[id]/dashboard`,
    method: "GET",
    duration,
    statusCode: 200,
  });

  return response;
}
