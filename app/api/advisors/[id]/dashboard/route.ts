// app/api/advisors/[id]/dashboard/route.ts
// API endpoint for fetching advisor dashboard statistics

import { NextRequest, NextResponse } from "next/server";
import { getAdvisorByNumber, getAdvisorClients, getAdvisorTasks } from "@/lib/db/neon";

// Force dynamic rendering since we use request.url
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const advisorIdOrNumber = params.id;

    // Get advisor by number or ID
    let advisor;
    let advisorId;

    if (advisorIdOrNumber.startsWith("ADV-")) {
      // It's an advisor number
      advisor = await getAdvisorByNumber(advisorIdOrNumber);
      if (!advisor) {
        return NextResponse.json(
          { error: "Advisor not found" },
          { status: 404 }
        );
      }
      advisorId = advisor.id;
    } else {
      // Assume it's a UUID - need to get advisor by ID
      // For now, try to get by number first, then fallback
      advisor = await getAdvisorByNumber(advisorIdOrNumber);
      if (!advisor) {
        return NextResponse.json(
          { error: "Advisor not found. Please use advisor number (e.g., ADV-001)." },
          { status: 404 }
        );
      }
      advisorId = advisor.id;
    }

    // Get advisor's clients
    const clients = await getAdvisorClients(advisorId, 200);
    
    // Get advisor's tasks
    const allTasks = await getAdvisorTasks(advisorId);
    const openTasks = allTasks.filter((t: any) => t.status === 'Open' || t.status === 'In Progress');
    
    // Get today's tasks
    const today = new Date().toISOString().split('T')[0];
    const tasksToday = openTasks.filter((t: any) => {
      if (!t.due_date) return false;
      const dueDate = new Date(t.due_date).toISOString().split('T')[0];
      return dueDate === today;
    });

    // Calculate dashboard stats
    const dashboardStats = {
      activeClients: advisor.active_clients || clients.length,
      tasksToday: tasksToday.length,
      meetingsScheduled: 0, // Not in database yet - would need meetings table
      monthlyTarget: parseFloat(advisor.monthly_target?.toString() || "0"),
      currentSales: parseFloat(advisor.monthly_sales?.toString() || "0"),
      conversionRate: parseFloat(advisor.conversion_rate?.toString() || "0"),
      avgResponseTime: "2.3 hours", // Not in database - would need to calculate from interactions
      clientSatisfaction: parseFloat(advisor.satisfaction_score?.toString() || "0") / 20, // Convert from 0-100 to 0-5 scale
    };

    // Get recent tasks (top 3 by priority and due date)
    const recentTasks = openTasks
      .sort((a: any, b: any) => {
        const priorityOrder = { 'Urgent': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
        if (aPriority !== bPriority) return bPriority - aPriority;
        
        // Then by due date
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      })
      .slice(0, 3)
      .map((task: any) => {
        // Get customer name if available
        const taskClient = clients.find((c: any) => c.id === task.customer_id);
        return {
          id: task.task_number || task.id,
          type: task.task_type,
          client: taskClient ? `${taskClient.first_name} ${taskClient.last_name}` : "Unknown Client",
          priority: task.priority,
          description: task.description || task.title,
          dueDate: task.due_date ? new Date(task.due_date).toLocaleDateString() : "No due date",
        };
      });

    // Upcoming meetings (placeholder - would need meetings table)
    const upcomingMeetings: any[] = [];

    return NextResponse.json({
      advisor: {
        id: advisor.advisor_number,
        name: `${advisor.first_name} ${advisor.last_name}`,
      },
      stats: dashboardStats,
      recentTasks,
      upcomingMeetings,
    });
  } catch (error) {
    console.error("Error fetching advisor dashboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch advisor dashboard" },
      { status: 500 }
    );
  }
}

