// app/api/advisors/[id]/clients/route.ts
// API endpoint for fetching advisor's clients

import { NextRequest, NextResponse } from "next/server";
import { getAdvisorClients, getAdvisorByNumber } from "@/lib/db/neon";

// Force dynamic rendering since we use request.url
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const advisorIdOrNumber = params.id;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");

    // Try to get advisor by number first (if it's ADV-001 format)
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
      // Assume it's a UUID
      advisorId = advisorIdOrNumber;
    }

    // Get clients for advisor
    const clients = await getAdvisorClients(advisorId, limit);

    // Transform to match frontend expected format
    const transformedClients = clients.map((client: any) => ({
      id: client.customer_number || client.id,
      customerNumber: client.customer_number,
      name: `${client.first_name} ${client.last_name}`,
      firstName: client.first_name,
      lastName: client.last_name,
      segment: client.segment,
      engagementScore: client.engagement_score ? parseFloat(client.engagement_score.toString()) : 0,
      lifetimeValue: client.lifetime_value ? parseFloat(client.lifetime_value.toString()) : 0,
    }));

    return NextResponse.json(transformedClients);
  } catch (error) {
    console.error("Error fetching advisor clients:", error);
    return NextResponse.json(
      { error: "Failed to fetch advisor clients" },
      { status: 500 }
    );
  }
}

