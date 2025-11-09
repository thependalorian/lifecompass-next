// app/api/chat/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createAgent } from "@/lib/agent";
import { ChatRequest } from "@/lib/agent/models";
import { rateLimit, getClientIdentifier } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimitResult = rateLimit(clientId);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: "Too many requests. Please try again later.",
          resetAt: rateLimitResult.resetAt,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": "30",
            "X-RateLimit-Remaining": String(rateLimitResult.remaining),
            "X-RateLimit-Reset": String(
              Math.floor(rateLimitResult.resetAt / 1000),
            ),
            "Retry-After": String(
              Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000),
            ),
          },
        },
      );
    }

    const body: ChatRequest = await request.json();

    // Security: Extract persona information from request metadata
    // Frontend should pass this from sessionStorage
    const metadata = {
      ...body.metadata,
      selectedCustomerPersona: body.metadata?.selectedCustomerPersona,
      selectedAdvisorPersona: body.metadata?.selectedAdvisorPersona,
      userType: body.metadata?.userType || "customer",
    };

    // For demo purposes, return enhanced mock responses based on consolidated knowledge
    if (!process.env.DATABASE_URL) {
      const message = body.message?.toLowerCase() || "";

      let responseMessage = "";
      let sources = [];
      let toolsUsed = [];

      if (message.includes("severe illness") || message.includes("omp")) {
        responseMessage =
          "Based on our consolidated insurance products data, OMP Severe Illness Cover provides lump sum payments for 68 severe illnesses. Coverage starts from N$40/month with comprehensive family protection benefits. Would you like me to provide detailed information about eligibility or claim procedures?";
        sources = ["INSURANCE_PRODUCTS_CONSOLIDATED.md"];
        toolsUsed = ["knowledge_base_search"];
      } else if (message.includes("funeral") || message.includes("death")) {
        responseMessage =
          "From our death claims consolidated guide, funeral benefits are paid within 48 hours when all required documentation is submitted (death certificate, beneficiary forms, banking details). OMP Funeral Care plans start from N$40/month with extended family coverage. I can help you understand the claims process or product options.";
        sources = [
          "DEATH_CLAIMS_CONSOLIDATED.md",
          "INSURANCE_PRODUCTS_CONSOLIDATED.md",
        ];
        toolsUsed = ["claims_procedure_lookup"];
      } else if (
        message.includes("unit trust") ||
        message.includes("investment")
      ) {
        responseMessage =
          "Our investment retirement guide shows Old Mutual Unit Trusts offer professional management with minimum investments from N$100/month. The Income Fund provides 7.2% annual returns with high income focus. Would you like information about specific funds or retirement planning?";
        sources = ["INVESTMENT_RETIREMENT_CONSOLIDATED.md"];
        toolsUsed = ["investment_calculator"];
      } else if (message.includes("claim") || message.includes("disability")) {
        responseMessage =
          "According to our disability claims consolidated information, OMP Disability Income Cover provides 75% income replacement after a 6-month waiting period. Claims are processed within 15 working days of receiving complete documentation. I can guide you through the claim requirements.";
        sources = ["DISABILITY_CLAIMS_CONSOLIDATED.md"];
        toolsUsed = ["claims_assistance"];
      } else {
        responseMessage = `I understand you're asking about "${body.message}". I have access to comprehensive Old Mutual Namibia product information including insurance, investments, claims procedures, and business solutions. Please ask about specific products like OMP Severe Illness Cover, funeral insurance, unit trusts, or claims processes for more detailed assistance.`;
        sources = ["KNOWLEDGE_BASE_OVERVIEW"];
        toolsUsed = ["general_assistance"];
      }

      return NextResponse.json(
        {
          message: responseMessage,
          sessionId: body.sessionId || "demo-session",
          sources,
          toolsUsed,
          metadata: {
            demo: true,
            knowledge_base_available: true,
            consolidated_files_count: 7,
          },
        },
        {
          headers: {
            "X-RateLimit-Limit": "30",
            "X-RateLimit-Remaining": String(rateLimitResult.remaining),
            "X-RateLimit-Reset": String(
              Math.floor(rateLimitResult.resetAt / 1000),
            ),
          },
        },
      );
    }

    const agent = createAgent({
      sessionId: body.sessionId || "",
      userId: body.userId,
      searchPreferences: {
        useVector: true,
        useGraph: true,
        defaultLimit: 10,
      },
      metadata: metadata, // Pass persona info in metadata
    });

    const response = await agent.executeAgent({
      ...body,
      metadata: metadata, // Ensure persona info is passed to agent
    });

    return NextResponse.json(response, {
      headers: {
        "X-RateLimit-Limit": "30",
        "X-RateLimit-Remaining": String(rateLimitResult.remaining),
        "X-RateLimit-Reset": String(Math.floor(rateLimitResult.resetAt / 1000)),
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;

    // Always show error details for debugging (can be removed in production later)
    return NextResponse.json(
      {
        error: "Failed to process chat request",
        message: errorMessage,
        stack: process.env.NODE_ENV === "development" ? errorStack : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
