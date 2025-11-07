// app/api/templates/route.ts
// API endpoint for message templates
// Uses templates table from database

import { NextRequest, NextResponse } from "next/server";
import { getAllTemplates, createTemplate, getAdvisorByNumber } from "@/lib/db/neon";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const advisorId = searchParams.get("advisorId");
    const advisorNumber = searchParams.get("advisorNumber");

    // Resolve advisor ID if needed
    let resolvedAdvisorId: string | undefined;
    if (advisorNumber) {
      const advisor = await getAdvisorByNumber(advisorNumber);
      if (advisor) {
        resolvedAdvisorId = advisor.id;
      }
    } else if (advisorId) {
      resolvedAdvisorId = advisorId;
    }

    // Fetch templates from database
    let templates;
    try {
      templates = await getAllTemplates(resolvedAdvisorId, category || undefined);
    } catch (error) {
      // If templates table doesn't exist yet, return default templates
      console.warn("Templates table not found, using defaults:", error);
      const defaultTemplates = [
        {
          id: "TPL-001",
          templateNumber: "TPL-001",
          name: "Welcome Message",
          category: "Onboarding",
          content: "Welcome to Old Mutual! I'm your dedicated advisor and I'm here to help you with all your insurance needs.",
          isGlobal: true,
        },
        {
          id: "TPL-002",
          templateNumber: "TPL-002",
          name: "Renewal Reminder",
          category: "Policy Management",
          content: "Your policy is due for renewal. Please contact me to discuss your options and ensure continuous coverage.",
          isGlobal: true,
        },
        {
          id: "TPL-003",
          templateNumber: "TPL-003",
          name: "Claim Update",
          category: "Claims",
          content: "Your claim has been processed. Here are the details of the payout and next steps.",
          isGlobal: true,
        },
      ];
      
      let filteredTemplates = defaultTemplates;
      if (category) {
        filteredTemplates = defaultTemplates.filter((t) => t.category === category);
      }
      
      return NextResponse.json(filteredTemplates);
    }

    // Transform to match frontend expected format
    const transformedTemplates = templates.map((template: any) => ({
      id: template.template_number || template.id,
      templateNumber: template.template_number,
      name: template.name,
      category: template.category,
      content: template.content,
      isGlobal: template.is_global,
      usageCount: template.usage_count || 0,
    }));

    // Filter by category if provided
    let filteredTemplates = transformedTemplates;
    if (category) {
      filteredTemplates = transformedTemplates.filter((t: any) => t.category === category);
    }

    return NextResponse.json(filteredTemplates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { advisorId, advisorNumber, name, category, content, isGlobal } = body;

    if (!name || !category || !content) {
      return NextResponse.json(
        { error: "Missing required fields: name, category, and content are required" },
        { status: 400 }
      );
    }

    // Resolve advisor ID
    let resolvedAdvisorId: string;
    if (advisorNumber) {
      const advisor = await getAdvisorByNumber(advisorNumber);
      if (!advisor) {
        return NextResponse.json(
          { error: `Advisor not found: ${advisorNumber}` },
          { status: 404 }
        );
      }
      resolvedAdvisorId = advisor.id;
    } else if (advisorId) {
      resolvedAdvisorId = advisorId;
    } else {
      return NextResponse.json(
        { error: "advisorId or advisorNumber is required" },
        { status: 400 }
      );
    }

    // Create template in database
    try {
      const newTemplate = await createTemplate(resolvedAdvisorId, {
        name,
        category,
        content,
        isGlobal: isGlobal || false,
      });

      // Transform to match frontend expected format
      const transformedTemplate = {
        id: newTemplate.template_number || newTemplate.id,
        templateNumber: newTemplate.template_number,
        name: newTemplate.name,
        category: newTemplate.category,
        content: newTemplate.content,
        isGlobal: newTemplate.is_global,
        usageCount: newTemplate.usage_count || 0,
      };

      return NextResponse.json(transformedTemplate, { status: 201 });
    } catch (error: any) {
      // If templates table doesn't exist, return mock template
      if (error.message?.includes("does not exist") || error.message?.includes("relation")) {
        console.warn("Templates table not found, returning mock template");
        return NextResponse.json({
          id: `TPL-${Date.now()}`,
          templateNumber: `TPL-${Date.now()}`,
          name,
          category,
          content,
          isGlobal: isGlobal || false,
          usageCount: 0,
        }, { status: 201 });
      }
      throw error;
    }
  } catch (error) {
    console.error("Error creating template:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { 
        error: "Failed to create template",
        message: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

