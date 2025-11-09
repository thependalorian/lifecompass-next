// app/api/policies/route.ts
// API endpoint for fetching policies from database

import { NextRequest, NextResponse } from "next/server";
import { getCustomerPolicies, getCustomerByNumber } from "@/lib/db/neon";

// Force dynamic rendering since we use request.url
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerNumber = searchParams.get("customerNumber");
    const customerId = searchParams.get("customerId");

    // Input validation: ensure at least one parameter is provided
    if (!customerNumber && !customerId) {
      return NextResponse.json(
        { error: "customerNumber or customerId parameter is required" },
        { status: 400 },
      );
    }

    // Sanitize inputs
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

    // Validate customer ID format if provided (should be UUID or valid ID)
    if (
      sanitizedCustomerId &&
      (sanitizedCustomerId.length === 0 || sanitizedCustomerId.length > 100)
    ) {
      return NextResponse.json(
        { error: "Invalid customer ID format" },
        { status: 400 },
      );
    }

    let policies;

    if (sanitizedCustomerNumber) {
      // Get customer by number first
      const customer = await getCustomerByNumber(sanitizedCustomerNumber);
      if (!customer) {
        return NextResponse.json(
          { error: "Customer not found" },
          { status: 404 },
        );
      }
      // Get policies for customer
      policies = await getCustomerPolicies(customer.id);
    } else if (sanitizedCustomerId) {
      // Get policies directly by customer ID (UUID)
      policies = await getCustomerPolicies(sanitizedCustomerId);
    } else {
      // This should not happen due to validation above, but keep as safety check
      return NextResponse.json(
        { error: "customerNumber or customerId parameter is required" },
        { status: 400 },
      );
    }

    // Transform to match frontend expected format
    const transformedPolicies = policies.map((policy: any) => ({
      id: policy.policy_number || policy.id,
      policyNumber: policy.policy_number,
      type: policy.product_type,
      subtype: policy.product_subtype,
      status: policy.status,
      coverageAmount: policy.coverage_amount
        ? parseFloat(policy.coverage_amount.toString())
        : null,
      premiumAmount: policy.premium_amount
        ? parseFloat(policy.premium_amount.toString())
        : null,
      premiumFrequency: policy.premium_frequency || "Monthly",
      startDate: policy.start_date,
      endDate: policy.end_date,
      renewalDate: policy.renewal_date,
      sumAssured: policy.sum_assured
        ? parseFloat(policy.sum_assured.toString())
        : null,
      beneficiaries: policy.beneficiaries || [],
      underwritingClass: policy.underwriting_class,
      paymentMethod: policy.payment_method,
      paymentStatus: policy.payment_status || "Current",
      advisorId: policy.advisor_id,
      customerId: policy.customer_id,
      createdAt: policy.created_at,
    }));

    return NextResponse.json(transformedPolicies);
  } catch (error) {
    console.error("Error fetching policies:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Failed to fetch policies",
        message:
          process.env.NODE_ENV === "development"
            ? errorMessage
            : "Unable to load policies. Please try again or contact support if the problem persists.",
      },
      { status: 500 },
    );
  }
}
