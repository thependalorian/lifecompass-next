// app/api/interactions/route.ts
// API endpoint for fetching interactions from database

import { NextRequest, NextResponse } from "next/server";
import { getCustomerInteractions, getCustomerByNumber } from "@/lib/db/neon";

// Force dynamic rendering since we use request.url
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerNumber = searchParams.get("customerNumber");
    const customerId = searchParams.get("customerId");
    const advisorId = searchParams.get("advisorId");
    const limit = parseInt(searchParams.get("limit") || "10");

    let interactions;

    if (customerNumber) {
      // Get customer by number first
      const customer = await getCustomerByNumber(customerNumber);
      if (!customer) {
        return NextResponse.json(
          { error: "Customer not found" },
          { status: 404 }
        );
      }
      // Get interactions for customer
      interactions = await getCustomerInteractions(customer.id, limit);
    } else if (customerId) {
      // Get interactions directly by customer ID (UUID)
      interactions = await getCustomerInteractions(customerId, limit);
    } else if (advisorId) {
      // Get interactions for advisor (requires new helper function)
      // For now, return empty - will need to implement getInteractionsByAdvisor
      return NextResponse.json(
        { error: "Advisor interactions not yet implemented. Use customerNumber or customerId." },
        { status: 400 }
      );
    } else {
      return NextResponse.json(
        { error: "customerNumber, customerId, or advisorId parameter is required" },
        { status: 400 }
      );
    }

    // Transform to match frontend expected format
    const transformedInteractions = interactions.map((interaction: any) => ({
      id: interaction.interaction_number || interaction.id,
      interactionNumber: interaction.interaction_number,
      type: interaction.interaction_type,
      channel: interaction.channel,
      direction: interaction.direction,
      subject: interaction.subject,
      content: interaction.content,
      sentiment: interaction.sentiment,
      intent: interaction.intent,
      outcome: interaction.outcome,
      durationMinutes: interaction.duration_minutes,
      qualityScore: interaction.quality_score ? parseFloat(interaction.quality_score.toString()) : null,
      followUpRequired: interaction.follow_up_required || false,
      followUpDate: interaction.follow_up_date,
      customerId: interaction.customer_id,
      advisorId: interaction.advisor_id,
      createdAt: interaction.created_at,
    }));

    return NextResponse.json(transformedInteractions);
  } catch (error) {
    console.error("Error fetching interactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch interactions" },
      { status: 500 }
    );
  }
}

