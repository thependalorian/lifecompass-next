// app/api/persona/name/route.ts
// API endpoint to get persona name for personalized greetings

import { NextRequest, NextResponse } from "next/server";
import {
  getCustomerByNumber,
  getAdvisorByNumber,
} from "@/lib/db/neon";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const customerPersona = searchParams.get("customerPersona");
    const advisorPersona = searchParams.get("advisorPersona");

    // CRITICAL FIX: Prioritize customer persona if both are provided
    // This ensures customer personas aren't treated as advisors
    // Only check advisor if customer is NOT set
    if (customerPersona && !advisorPersona) {
      const customer = await getCustomerByNumber(customerPersona);
      if (customer) {
        return NextResponse.json({
          name: `${customer.first_name} ${customer.last_name}`,
          firstName: customer.first_name,
          lastName: customer.last_name,
          type: "customer",
        });
      }
    }

    if (advisorPersona && !customerPersona) {
      const advisor = await getAdvisorByNumber(advisorPersona);
      if (advisor) {
        return NextResponse.json({
          name: `${advisor.first_name} ${advisor.last_name}`,
          firstName: advisor.first_name,
          lastName: advisor.last_name,
          type: "advisor",
        });
      }
      // Advisor not found - return 404 (will trigger cleanup in frontend)
      return NextResponse.json(
        { error: `Advisor persona "${advisorPersona}" not found` },
        { status: 404 },
      );
    }

    // If both are provided, prioritize customer (shouldn't happen, but safety check)
    if (customerPersona && advisorPersona) {
      console.warn(
        "[Persona API] Both customer and advisor personas provided, prioritizing customer",
      );
      const customer = await getCustomerByNumber(customerPersona);
      if (customer) {
        return NextResponse.json({
          name: `${customer.first_name} ${customer.last_name}`,
          firstName: customer.first_name,
          lastName: customer.last_name,
          type: "customer",
        });
      }
    }

    return NextResponse.json(
      { error: "Persona not found" },
      { status: 404 },
    );
  } catch (error: any) {
    console.error("Get persona name error:", error);
    return NextResponse.json(
      { error: "Failed to get persona name", details: error.message },
      { status: 500 },
    );
  }
}

