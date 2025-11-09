// app/api/activity/route.ts
// API endpoint for fetching recent customer activity from multiple sources

import { NextRequest, NextResponse } from "next/server";
import {
  getCustomerByNumber,
  getCustomerPolicies,
  getCustomerClaims,
  getCustomerInteractions,
  getCustomerCommunications,
} from "@/lib/db/neon";

// Force dynamic rendering since we use request.url
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerNumber = searchParams.get("customerNumber");
    const customerId = searchParams.get("customerId");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!customerNumber) {
      return NextResponse.json(
        { error: "customerNumber parameter is required" },
        { status: 400 },
      );
    }

    const customer = await getCustomerByNumber(customerNumber);
    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 },
      );
    }

    // Fetch activity from multiple sources
    const [policies, claims, interactions, communications] = await Promise.all([
      getCustomerPolicies(customer.id),
      getCustomerClaims(customer.id),
      getCustomerInteractions(customer.id, 20),
      getCustomerCommunications(customer.id, 20),
    ]);

    // Combine and format activities
    const activities: any[] = [];

    // Add policy activities (new policies, renewals)
    policies.slice(0, 5).forEach((policy: any) => {
      const policyDate = new Date(policy.created_at || policy.updated_at);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const isRecent = policyDate > thirtyDaysAgo;

      activities.push({
        id: `policy-${policy.id}`,
        type: "policy",
        action:
          policy.status === "Active"
            ? `${policy.product_type}${policy.product_subtype ? ` - ${policy.product_subtype}` : ""} policy ${isRecent ? "created" : "active"}`
            : `${policy.product_type} policy ${policy.status.toLowerCase()}`,
        policy: `${policy.product_type}${policy.product_subtype ? ` - ${policy.product_subtype}` : ""}`,
        date: policy.created_at || policy.updated_at,
        status:
          policy.status === "Active"
            ? "success"
            : policy.status === "Lapsed"
              ? "warning"
              : "info",
        details: policy.coverage_amount
          ? `Coverage: N$${parseFloat(policy.coverage_amount.toString()).toLocaleString()}, Premium: N$${parseFloat(policy.premium_amount?.toString() || "0").toLocaleString()}/${policy.premium_frequency || "Monthly"}`
          : `Policy ${policy.policy_number}`,
        policyNumber: policy.policy_number,
      });
    });

    // Add claim activities
    claims.slice(0, 5).forEach((claim: any) => {
      activities.push({
        id: `claim-${claim.id}`,
        type: "claim",
        action: `${claim.claim_type} claim ${claim.status.toLowerCase()}`,
        policy: claim.claim_type,
        date: claim.reported_date || claim.created_at,
        status:
          claim.status === "Approved" || claim.status === "Paid"
            ? "success"
            : claim.status === "Rejected"
              ? "error"
              : "info",
        details: claim.approved_amount
          ? `Approved amount: N$${parseFloat(claim.approved_amount.toString()).toLocaleString()}`
          : claim.status === "Submitted"
            ? "Claim submitted and under review"
            : `Claim ${claim.claim_number}`,
        claimNumber: claim.claim_number,
      });
    });

    // Add interaction activities
    interactions.slice(0, 5).forEach((interaction: any) => {
      const actionMap: Record<string, string> = {
        Inquiry: "Inquiry made",
        Complaint: "Complaint submitted",
        Request: "Request submitted",
        Feedback: "Feedback provided",
        Meeting: "Meeting scheduled",
        Call: "Phone call",
        Email: "Email sent",
        Chat: "Chat conversation",
      };

      activities.push({
        id: `interaction-${interaction.id}`,
        type: "interaction",
        action:
          actionMap[interaction.interaction_type] ||
          `${interaction.interaction_type} interaction`,
        policy: interaction.subject || interaction.interaction_type,
        date: interaction.created_at,
        status:
          interaction.outcome === "Resolved" ||
          interaction.outcome === "Completed"
            ? "success"
            : "info",
        details: interaction.content
          ? interaction.content.substring(0, 100) +
            (interaction.content.length > 100 ? "..." : "")
          : `${interaction.channel} via ${interaction.direction}`,
        interactionNumber: interaction.interaction_number,
      });
    });

    // Add communication activities
    communications.slice(0, 5).forEach((comm: any) => {
      activities.push({
        id: `comm-${comm.id}`,
        type: "communication",
        action: `${comm.type} ${comm.status === "Sent" ? "sent" : comm.status === "Delivered" ? "delivered" : comm.status.toLowerCase()}`,
        policy: comm.subject || comm.type,
        date: comm.sent_at || comm.created_at,
        status:
          comm.status === "Sent" || comm.status === "Delivered"
            ? "success"
            : "info",
        details: comm.content
          ? comm.content.substring(0, 100) +
            (comm.content.length > 100 ? "..." : "")
          : `${comm.type} communication`,
        communicationNumber: comm.communication_number,
      });
    });

    // Sort by date (most recent first) and limit
    activities.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });

    return NextResponse.json(activities.slice(0, limit));
  } catch (error) {
    console.error("Error fetching activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500 },
    );
  }
}
