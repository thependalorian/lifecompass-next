// app/api/claims/route.ts
// API endpoint for fetching claims from database

import { NextRequest, NextResponse } from "next/server";
import {
  getCustomerClaims,
  getAllClaims,
  getCustomerByNumber,
} from "@/lib/db/neon";

// Force dynamic rendering since we use request.url
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerNumber = searchParams.get("customerNumber");
    const customerId = searchParams.get("customerId");
    const limitParam = searchParams.get("limit");

    // Input validation and sanitization
    const sanitizedCustomerNumber = customerNumber?.trim();
    const sanitizedCustomerId = customerId?.trim();

    // Validate customer number format if provided
    if (
      sanitizedCustomerNumber &&
      (sanitizedCustomerNumber.length === 0 ||
        sanitizedCustomerNumber.length > 50)
    ) {
      return NextResponse.json(
        { error: "Invalid customer number format" },
        { status: 400 },
      );
    }

    // Validate customer ID format if provided
    if (
      sanitizedCustomerId &&
      (sanitizedCustomerId.length === 0 || sanitizedCustomerId.length > 100)
    ) {
      return NextResponse.json(
        { error: "Invalid customer ID format" },
        { status: 400 },
      );
    }

    // Validate and sanitize limit parameter
    let limit = 100; // Default limit
    if (limitParam) {
      const parsedLimit = parseInt(limitParam, 10);
      if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 1000) {
        return NextResponse.json(
          { error: "Limit must be a number between 1 and 1000" },
          { status: 400 },
        );
      }
      limit = parsedLimit;
    }

    let claims;

    if (sanitizedCustomerNumber) {
      // Get customer by number first
      const customer = await getCustomerByNumber(sanitizedCustomerNumber);
      if (!customer) {
        return NextResponse.json(
          { error: "Customer not found" },
          { status: 404 },
        );
      }
      // Get claims for customer
      claims = await getCustomerClaims(customer.id);
    } else if (sanitizedCustomerId) {
      // Get claims directly by customer ID (UUID)
      claims = await getCustomerClaims(sanitizedCustomerId);
    } else {
      // Get all claims (for admin/advisor view)
      claims = await getAllClaims(limit);
    }

    // Transform to match frontend expected format
    const transformedClaims = claims.map((claim: any) => ({
      id: claim.claim_number || claim.id,
      claimNumber: claim.claim_number,
      type: claim.claim_type,
      status: claim.status,
      incidentDate: claim.incident_date,
      reportedDate: claim.reported_date,
      approvedAmount: claim.approved_amount
        ? parseFloat(claim.approved_amount.toString())
        : null,
      paidAmount: claim.paid_amount
        ? parseFloat(claim.paid_amount.toString())
        : null,
      processingTimeDays: claim.processing_time_days,
      assessorId: claim.assessor_id,
      documents: claim.documents || [],
      causeOfLoss: claim.cause_of_loss,
      reserveAmount: claim.reserve_amount
        ? parseFloat(claim.reserve_amount.toString())
        : null,
      policyId: claim.policy_id,
      customerId: claim.customer_id,
      customerNumber: claim.customer_number || null,
      createdAt: claim.created_at,
    }));

    return NextResponse.json(transformedClaims);
  } catch (error) {
    console.error("Error fetching claims:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Failed to fetch claims",
        message:
          process.env.NODE_ENV === "development"
            ? errorMessage
            : "Unable to load claims. Please try again or contact support if the problem persists.",
      },
      { status: 500 },
    );
  }
}
