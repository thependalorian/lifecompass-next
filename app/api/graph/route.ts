// app/api/graph/route.ts
// Knowledge Graph API endpoint - Showcase version (no backend required)

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, action } = body;

    if (!query && !action) {
      return NextResponse.json(
        { error: "Query or action is required" },
        { status: 400 }
      );
    }

    // Route to appropriate LifeCompass API endpoint
    let endpoint = "/search/graph";
    let payload: any = { query, limit: 10 };

    if (action === "related") {
      // Use graph search with related entity query
      endpoint = "/search/graph";
      payload = { query: `relationships involving ${query}`, limit: 10 };
    } else if (action === "timeline") {
      // Use graph search with timeline query
      endpoint = "/search/graph";
      payload = { query: `timeline history of ${query}`, limit: 10 };
    } else if (action === "stats") {
      // Use health endpoint for stats
      endpoint = "/health";
      payload = null;
    }

    const fetchOptions: RequestInit = {
      method: action === "stats" ? "GET" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (payload && action !== "stats") {
      fetchOptions.body = JSON.stringify(payload);
    }

    const response = await fetch(`${process.env.GRAPH_API_URL}${endpoint}`, fetchOptions);

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `Graph API error: ${error}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Transform response format for consistency
    if (action === "stats") {
      // Transform health check response to stats format
      return NextResponse.json({
        graphiti_initialized: data.graph_database || false,
        database_status: data.database || false,
        status: data.status,
        version: data.version,
      });
    } else {
      // Handle graph search results - API returns {graph_results: [...]}
      if (data.graph_results && Array.isArray(data.graph_results)) {
        return NextResponse.json(data.graph_results);
      } else if (Array.isArray(data)) {
        return NextResponse.json(data);
      } else {
        return NextResponse.json([]);
      }
    }
  } catch (error: any) {
    console.error("Graph API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to query knowledge graph" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Enhanced showcase version with consolidated Old Mutual data stats
  return NextResponse.json({
    graphiti_initialized: true,
    total_facts: 485,
    total_entities: 42,
    total_relationships: 156,
    documents_processed: 10,
    consolidated_files: [
      "INVESTMENT_RETIREMENT_CONSOLIDATED.md",
      "INSURANCE_PRODUCTS_CONSOLIDATED.md",
      "BUSINESS_PRODUCTS_CONSOLIDATED.md",
      "WEALTH_FINANCIAL_ADVISORY_CONSOLIDATED.md",
      "DEATH_CLAIMS_CONSOLIDATED.md",
      "DISABILITY_CLAIMS_CONSOLIDATED.md",
      "GENERAL_CLAIMS_CONSOLIDATED.md"
    ],
    product_categories: [
      "OMP Severe Illness Cover",
      "OMP Funeral Insurance",
      "OMP Disability Income Cover",
      "Old Mutual Unit Trusts",
      "KPF Business Insurance",
      "Claims Processing"
    ],
    status: "enhanced-showcase",
    note: "Knowledge graph populated with comprehensive Old Mutual Namibia product and claims data",
    last_updated: "2025-11-04",
  });
}

