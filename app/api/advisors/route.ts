// app/api/advisors/route.ts
// API endpoint for fetching advisors from database

import { NextRequest, NextResponse } from "next/server";
import { getAllAdvisors, getAdvisorByNumber } from "@/lib/db/neon";

// Force dynamic rendering since we use request.url
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const advisorNumber = searchParams.get("number");

    if (advisorNumber) {
      // Get single advisor by number
      const advisor = await getAdvisorByNumber(advisorNumber);
      
      if (!advisor) {
        return NextResponse.json(
          { error: "Advisor not found" },
          { status: 404 }
        );
      }

      // Transform to match frontend expected format
      return NextResponse.json({
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
        satisfactionScore: parseFloat(advisor.satisfaction_score?.toString() || "0"),
        performanceRating: advisor.performance_rating,
        avatarUrl: advisor.avatar_url || null,
        type: "advisor",
      });
    }

    // Get all advisors
    const advisors = await getAllAdvisors();

    // Transform to match frontend expected format
    const transformedAdvisors = advisors.map((advisor: any) => ({
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
      satisfactionScore: parseFloat(advisor.satisfaction_score?.toString() || "0"),
      performanceRating: advisor.performance_rating,
      avatarUrl: advisor.avatar_url || null,
      type: "advisor",
    }));

    return NextResponse.json(transformedAdvisors);
  } catch (error) {
    console.error("Error fetching advisors:", error);
    return NextResponse.json(
      { error: "Failed to fetch advisors" },
      { status: 500 }
    );
  }
}

