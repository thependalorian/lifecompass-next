// app/api/tasks/route.ts
// API endpoint for fetching tasks from database

import { NextRequest, NextResponse } from "next/server";
import { getAdvisorTasks, getAdvisorByNumber, createTask } from "@/lib/db/neon";

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
    // Normalize priority to match expected type
    const normalizedPriority = priority 
      ? (priority.toLowerCase() as "high" | "medium" | "low" | "urgent" | undefined)
      : undefined;
    
    const tasks = await getAdvisorTasks(
      advisorId,
      status || undefined,
      normalizedPriority
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { advisorId, title, description, taskType, priority, status, dueDate, customerId, estimatedHours } = body;

    // Validate required fields
    if (!advisorId || !title || !taskType || !priority) {
      return NextResponse.json(
        { error: "Missing required fields: advisorId, title, taskType, and priority are required" },
        { status: 400 }
      );
    }

    // Check if advisorId is a UUID or advisor number
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(advisorId);
    
    let advisorIdResolved: string;
    if (isUUID) {
      advisorIdResolved = advisorId;
    } else {
      // It's an advisor number, look up the UUID
      const advisor = await getAdvisorByNumber(advisorId);
      if (!advisor) {
        return NextResponse.json(
          { error: `Advisor not found: ${advisorId}` },
          { status: 404 }
        );
      }
      advisorIdResolved = advisor.id;
    }

    // Validate and normalize priority to match database format
    const validPriorities = ["Low", "Medium", "High", "Urgent"];
    const normalizedPriority = validPriorities.includes(priority) 
      ? (priority as "Low" | "Medium" | "High" | "Urgent")
      : "Medium";

    // Create task
    const newTask = await createTask(advisorIdResolved, {
      title,
      description,
      taskType,
      priority: normalizedPriority,
      status,
      dueDate,
      customerId,
      estimatedHours,
    });

    // Transform to match frontend expected format
    const transformedTask = {
      id: newTask.task_number || newTask.id,
      taskNumber: newTask.task_number,
      title: newTask.title,
      description: newTask.description,
      type: newTask.task_type,
      priority: newTask.priority,
      status: newTask.status,
      dueDate: newTask.due_date,
      completedDate: null,
      customerId: newTask.customer_id,
      customerNumber: null,
      customerName: null,
      advisorId: newTask.advisor_id,
      estimatedHours: newTask.estimated_hours ? parseFloat(newTask.estimated_hours.toString()) : null,
      actualHours: null,
      createdAt: newTask.created_at,
    };

    return NextResponse.json(transformedTask, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { 
        error: "Failed to create task",
        message: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

