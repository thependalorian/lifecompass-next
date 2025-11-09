// app/api/customers/[id]/route.ts
// API endpoint for fetching a single customer by ID or customer number

import { NextRequest, NextResponse } from "next/server";
import { getCustomerByNumber } from "@/lib/db/neon";
import { maskCustomerPII, type MaskingLevel } from "@/lib/utils/pii-mask";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const customerIdOrNumber = params.id;

    // Input validation
    if (!customerIdOrNumber || typeof customerIdOrNumber !== "string") {
      return NextResponse.json(
        { error: "Customer ID or number is required" },
        { status: 400 },
      );
    }

    // Sanitize
    const sanitizedId = customerIdOrNumber.trim();
    if (sanitizedId.length === 0 || sanitizedId.length > 100) {
      return NextResponse.json(
        { error: "Invalid customer ID format" },
        { status: 400 },
      );
    }

    // Get customer by number (supports both CUST-001 format and UUID)
    const customer = await getCustomerByNumber(sanitizedId);

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 },
      );
    }

    // Transform to match frontend expected format
    const customerData = {
      id: customer.customer_number,
      customerNumber: customer.customer_number,
      name: `${customer.first_name} ${customer.last_name}`,
      firstName: customer.first_name,
      lastName: customer.last_name,
      email: customer.email,
      phone: customer.phone_primary,
      phoneSecondary: customer.phone_secondary,
      dateOfBirth: customer.date_of_birth,
      address: customer.address_street,
      city: customer.address_city,
      region: customer.address_region,
      occupation: customer.occupation,
      monthlyIncome: parseFloat(customer.monthly_income?.toString() || "0"),
      maritalStatus: customer.marital_status,
      dependentsCount: customer.dependents_count,
      segment: customer.segment,
      digitalAdoption: customer.digital_adoption_level,
      preferredLanguage: customer.preferred_language,
      preferredContactMethod: customer.preferred_contact_method,
      engagementScore: parseFloat(
        customer.engagement_score?.toString() || "0",
      ),
      lifetimeValue: parseFloat(customer.lifetime_value?.toString() || "0"),
      churnRisk: customer.churn_risk,
      primaryAdvisorId: customer.primary_advisor_id || null,
      avatarUrl: (customer as any).avatar_url || null,
      type: "customer",
    };

    // Determine masking level based on context
    // For hackathon: customers can see their own full data
    // In production, this would use proper authentication tokens
    const maskingLevel: MaskingLevel = "customer"; // Customers can see their own full data
    const maskedData = maskCustomerPII(customerData, {
      level: maskingLevel,
      maskName: false, // Customers see their own name
    });

    return NextResponse.json(maskedData);
  } catch (error) {
    console.error("Error fetching customer:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: "Failed to fetch customer",
        message:
          process.env.NODE_ENV === "development"
            ? errorMessage
            : "Please try again later.",
      },
      { status: 500 },
    );
  }
}

