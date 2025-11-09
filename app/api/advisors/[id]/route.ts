// app/api/advisors/[id]/route.ts
// API endpoint for fetching a single advisor by ID or advisor number

import { NextRequest, NextResponse } from "next/server";
import { getAdvisorByNumber } from "@/lib/db/neon";
import { maskAdvisorPII, type MaskingLevel } from "@/lib/utils/pii-mask";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const advisorIdOrNumber = params.id;

    // Input validation
    if (!advisorIdOrNumber || typeof advisorIdOrNumber !== "string") {
      return NextResponse.json(
        { error: "Advisor ID or number is required" },
        { status: 400 },
      );
    }

    // Sanitize
    const sanitizedId = advisorIdOrNumber.trim();
    if (sanitizedId.length === 0 || sanitizedId.length > 100) {
      return NextResponse.json(
        { error: "Invalid advisor ID format" },
        { status: 400 },
      );
    }

    // Get advisor by number (supports both ADV-001 format and UUID)
    const advisor = await getAdvisorByNumber(sanitizedId);

    if (!advisor) {
      return NextResponse.json(
        { error: "Advisor not found" },
        { status: 404 },
      );
    }

    // Transform to match frontend expected format
    const advisorData = {
      id: advisor.advisor_number,
      advisorNumber: advisor.advisor_number,
      name: `${advisor.first_name} ${advisor.last_name}`,
      firstName: advisor.first_name,
      lastName: advisor.last_name,
      email: advisor.email,
      phone: advisor.phone,
      specialization: advisor.specialization,
      experience: `${advisor.experience_years} years`,
      experienceYears: advisor.experience_years,
      clients: advisor.active_clients,
      location: advisor.region,
      branch: advisor.branch,
      description: `${advisor.specialization} with ${advisor.experience_years} years of experience serving clients in ${advisor.region}`,
      monthlyTarget: parseFloat(advisor.monthly_target?.toString() || "0"),
      currentSales: parseFloat(advisor.monthly_sales?.toString() || "0"),
      conversionRate: parseFloat(advisor.conversion_rate?.toString() || "0"),
      satisfactionScore: parseFloat(
        advisor.satisfaction_score?.toString() || "0",
      ),
      performanceRating: advisor.performance_rating,
      avatarUrl: advisor.avatar_url || null,
      type: "advisor",
    };

    // Apply PII masking (public level for demo)
    const maskingLevel: MaskingLevel = "public";
    const maskedData = maskAdvisorPII(advisorData, { level: maskingLevel });

    return NextResponse.json(maskedData);
  } catch (error) {
    console.error("Error fetching advisor:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: "Failed to fetch advisor",
        message:
          process.env.NODE_ENV === "development"
            ? errorMessage
            : "Please try again later.",
      },
      { status: 500 },
    );
  }
}

