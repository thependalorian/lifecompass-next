// app/api/tasks/route.ts
// API endpoint for fetching tasks from database

import { NextRequest, NextResponse } from "next/server";
import { getAdvisorTasks, getAdvisorByNumber } from "@/lib/db/neon";

// Force dynamic rendering since we use request.url
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const advisorIdOrNumber = searchParams.get("advisorId");
    const status = searchParams.get("status") as "open" | "completed" | "cancelled" | null;
    const priority = searchParams.get("priority") as "high" | "medium" | "low" | null;

    if (!advisorIdOrNumber) {
      return NextResponse.json(
        { error: "advisorId parameter is required" },
        { status: 400 }
      );
    }

    // Check if advisorIdOrNumber is a UUID or advisor number (e.g., "ADV-001")
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(advisorIdOrNumber);
    
    let advisorId: string;
    if (isUUID) {
      // Already a UUID, use it directly
      advisorId = advisorIdOrNumber;
    } else {
      // It's an advisor number, look up the UUID
      const advisor = await getAdvisorByNumber(advisorIdOrNumber);
      if (!advisor) {
        return NextResponse.json(
          { error: `Advisor not found: ${advisorIdOrNumber}` },
          { status: 404 }
        );
      }
      advisorId = advisor.id;
    }

    // Get tasks from database using the UUID
    const tasks = await getAdvisorTasks(
      advisorId,
      status || undefined,
      priority || undefined
    );

    // Transform to match frontend expected format
    const transformedTasks = tasks.map((task: any) => ({
      id: task.task_number || task.id,
      taskNumber: task.task_number,
      title: task.title,
      description: task.description,
      type: task.task_type,
      priority: task.priority,
      status: task.status,
      dueDate: task.due_date,
      completedDate: task.completed_date,
      customerId: task.customer_id,
      customerNumber: task.customer_number,
      customerName: task.customer_name,
      advisorId: task.advisor_id,
      estimatedHours: task.estimated_hours ? parseFloat(task.estimated_hours.toString()) : null,
      actualHours: task.actual_hours ? parseFloat(task.actual_hours.toString()) : null,
      createdAt: task.created_at,
    }));

    return NextResponse.json(transformedTasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { 
        error: "Failed to fetch tasks",
        message: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

