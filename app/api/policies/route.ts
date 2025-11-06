// app/api/policies/route.ts
// API endpoint for fetching policies from database

import { NextRequest, NextResponse } from "next/server";
import { getCustomerPolicies, getCustomerByNumber } from "@/lib/db/neon";

// Force dynamic rendering since we use request.url
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerNumber = searchParams.get("customerNumber");
    const customerId = searchParams.get("customerId");

    let policies;

    if (customerNumber) {
      // Get customer by number first
      const customer = await getCustomerByNumber(customerNumber);
      if (!customer) {
        return NextResponse.json(
          { error: "Customer not found" },
          { status: 404 }
        );
      }
      // Get policies for customer
      policies = await getCustomerPolicies(customer.id);
    } else if (customerId) {
      // Get policies directly by customer ID (UUID)
      policies = await getCustomerPolicies(customerId);
    } else {
      // Get all policies (for admin/advisor view)
      // Note: This requires a new helper function - for now return empty
      return NextResponse.json(
        { error: "customerNumber or customerId parameter is required" },
        { status: 400 }
      );
    }

    // Transform to match frontend expected format
    const transformedPolicies = policies.map((policy: any) => ({
      id: policy.policy_number || policy.id,
      policyNumber: policy.policy_number,
      type: policy.product_type,
      subtype: policy.product_subtype,
      status: policy.status,
      coverageAmount: policy.coverage_amount ? parseFloat(policy.coverage_amount.toString()) : null,
      premiumAmount: policy.premium_amount ? parseFloat(policy.premium_amount.toString()) : null,
      premiumFrequency: policy.premium_frequency,
      startDate: policy.start_date,
      endDate: policy.end_date,
      renewalDate: policy.renewal_date,
      customerId: policy.customer_id,
    }));

    return NextResponse.json(transformedPolicies);
  } catch (error) {
    console.error("Error fetching policies:", error);
    return NextResponse.json(
      { error: "Failed to fetch policies" },
      { status: 500 }
    );
  }
}

