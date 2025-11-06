// app/api/claims/route.ts
// API endpoint for fetching claims from database

import { NextRequest, NextResponse } from "next/server";
import { getCustomerClaims, getAllClaims, getCustomerByNumber } from "@/lib/db/neon";

// Force dynamic rendering since we use request.url
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerNumber = searchParams.get("customerNumber");
    const customerId = searchParams.get("customerId");

    let claims;

    if (customerNumber) {
      // Get customer by number first
      const customer = await getCustomerByNumber(customerNumber);
      if (!customer) {
        return NextResponse.json(
          { error: "Customer not found" },
          { status: 404 }
        );
      }
      // Get claims for customer
      claims = await getCustomerClaims(customer.id);
    } else if (customerId) {
      // Get claims directly by customer ID (UUID)
      claims = await getCustomerClaims(customerId);
    } else {
      // Get all claims (for admin/advisor view)
      const limit = parseInt(searchParams.get("limit") || "100");
      claims = await getAllClaims(limit);
    }

    // Transform to match frontend expected format
    const transformedClaims = claims.map((claim: any) => ({
      id: claim.claim_number || claim.id,
      claimNumber: claim.claim_number,
      type: claim.claim_type,
      status: claim.status,
      incidentDate: claim.incident_date,
      approvedAmount: claim.approved_amount ? parseFloat(claim.approved_amount.toString()) : null,
      paidAmount: claim.paid_amount ? parseFloat(claim.paid_amount.toString()) : null,
      processingTimeDays: claim.processing_time_days,
      policyId: claim.policy_id,
      customerId: claim.customer_id,
      customerNumber: claim.customer_number || null,
    }));

    return NextResponse.json(transformedClaims);
  } catch (error) {
    console.error("Error fetching claims:", error);
    return NextResponse.json(
      { error: "Failed to fetch claims" },
      { status: 500 }
    );
  }
}

