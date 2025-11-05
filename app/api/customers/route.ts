// app/api/customers/route.ts
// API endpoint for fetching customers from database

import { NextRequest, NextResponse } from "next/server";
import { getAllCustomers, getCustomerByNumber } from "@/lib/db/neon";

// Force dynamic rendering since we use request.url
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerNumber = searchParams.get("number");

    if (customerNumber) {
      // Get single customer by number
      const customer = await getCustomerByNumber(customerNumber);
      
      if (!customer) {
        return NextResponse.json(
          { error: "Customer not found" },
          { status: 404 }
        );
      }

      // Transform to match frontend expected format
      return NextResponse.json({
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
        engagementScore: parseFloat(customer.engagement_score?.toString() || "0"),
        lifetimeValue: parseFloat(customer.lifetime_value?.toString() || "0"),
        churnRisk: customer.churn_risk,
        type: "customer",
      });
    }

    // Get all customers
    const customers = await getAllCustomers();

    // Transform to match frontend expected format
    const transformedCustomers = customers.map((customer: any) => ({
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
      type: "customer",
    }));

    return NextResponse.json(transformedCustomers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

