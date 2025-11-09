// app/api/communications/route.ts
// API endpoint for fetching and creating communications

import { NextRequest, NextResponse } from "next/server";
import {
  getAdvisorCommunications,
  getCustomerCommunications,
  createCommunication,
  getAdvisorByNumber,
  incrementTemplateUsage,
} from "@/lib/db/neon";

// Force dynamic rendering since we use request.url
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const advisorId = searchParams.get("advisorId");
    const advisorNumber = searchParams.get("advisorNumber");
    const customerId = searchParams.get("customerId");
    const limit = parseInt(searchParams.get("limit") || "50");

    let communications;

    if (advisorId || advisorNumber) {
      // Get advisor by number if needed
      let resolvedAdvisorId = advisorId;
      if (advisorNumber && !advisorId) {
        const advisor = await getAdvisorByNumber(advisorNumber);
        if (!advisor) {
          return NextResponse.json(
            { error: "Advisor not found" },
            { status: 404 },
          );
        }
        resolvedAdvisorId = advisor.id;
      }

      if (!resolvedAdvisorId) {
        return NextResponse.json(
          { error: "advisorId or advisorNumber parameter is required" },
          { status: 400 },
        );
      }

      communications = await getAdvisorCommunications(resolvedAdvisorId, limit);
    } else if (customerId) {
      communications = await getCustomerCommunications(customerId, limit);
    } else {
      return NextResponse.json(
        {
          error:
            "advisorId, advisorNumber, or customerId parameter is required",
        },
        { status: 400 },
      );
    }

    // Transform to match frontend expected format
    const transformedCommunications = communications.map((comm: any) => {
      // Mask customer name for advisors - show customer number instead
      let customerName = comm.customer_name;
      let clientName = comm.customer_name;

      // If this is an advisor request, show full customer names with customer number
      if (advisorId || advisorNumber) {
        if (comm.customer_number && customerName) {
          // Show full name with customer number: "Maria Shikongo (CUST-001)"
          customerName = `${customerName} (${comm.customer_number})`;
          clientName = customerName;
        } else if (comm.customer_number) {
          // Just customer number if no name available
          customerName = comm.customer_number;
          clientName = comm.customer_number;
        }
        // If no customer number, keep original name (full name visible to advisors)
      }

      return {
        id: comm.communication_number || comm.id,
        communicationNumber: comm.communication_number,
        customerId: comm.customer_id,
        customerNumber: comm.customer_number,
        customerName: customerName,
        advisorId: comm.advisor_id,
        type: comm.type,
        subject: comm.subject,
        content: comm.content,
        status: comm.status,
        sentAt: comm.sent_at,
        deliveredAt: comm.delivered_at,
        readAt: comm.read_at,
        templateId: comm.template_id,
        createdAt: comm.created_at,
        // For compatibility with old format
        client: clientName,
        preview: comm.content?.substring(0, 100) || "",
        date: comm.sent_at || comm.created_at,
        read: !!comm.read_at,
        priority: "Medium", // Can be calculated from metadata or other fields
      };
    });

    return NextResponse.json(transformedCommunications);
  } catch (error) {
    console.error("Error fetching communications:", error);
    return NextResponse.json(
      { error: "Failed to fetch communications" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      advisorId,
      advisorNumber,
      customerId,
      type,
      subject,
      content,
      status,
      templateId,
    } = body;

    // Validate required fields
    if (!customerId || !type || !content) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: customerId, type, and content are required",
        },
        { status: 400 },
      );
    }

    // Resolve advisor ID
    let resolvedAdvisorId = advisorId;
    if (advisorNumber && !advisorId) {
      const advisor = await getAdvisorByNumber(advisorNumber);
      if (!advisor) {
        return NextResponse.json(
          { error: `Advisor not found: ${advisorNumber}` },
          { status: 404 },
        );
      }
      resolvedAdvisorId = advisor.id;
    }

    if (!resolvedAdvisorId) {
      return NextResponse.json(
        { error: "advisorId or advisorNumber is required" },
        { status: 400 },
      );
    }

    // Create communication
    const newCommunication = await createCommunication(resolvedAdvisorId, {
      customerId,
      type,
      subject,
      content,
      status,
      templateId,
    });

    // Increment template usage count if template was used
    if (templateId) {
      try {
        await incrementTemplateUsage(templateId);
      } catch (error) {
        console.warn("Failed to increment template usage:", error);
        // Non-critical, continue
      }
    }

    // Transform to match frontend expected format
    const transformedCommunication = {
      id: newCommunication.communication_number || newCommunication.id,
      communicationNumber: newCommunication.communication_number,
      customerId: newCommunication.customer_id,
      advisorId: newCommunication.advisor_id,
      type: newCommunication.type,
      subject: newCommunication.subject,
      content: newCommunication.content,
      status: newCommunication.status,
      sentAt: newCommunication.sent_at,
      createdAt: newCommunication.created_at,
    };

    return NextResponse.json(transformedCommunication, { status: 201 });
  } catch (error) {
    console.error("Error creating communication:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Failed to create communication",
        message: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
