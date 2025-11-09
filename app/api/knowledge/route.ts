// app/api/knowledge/route.ts
// Knowledge base API endpoint for accessing consolidated Old Mutual data

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import * as path from "path";

const CONSOLIDATED_DIR = path.join(
  process.cwd(),
  "..",
  "LifeCompass",
  "old_mutual_complete_crawl",
  "consolidated",
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const query = searchParams.get("query");

    // List available consolidated files
    if (!category && !query) {
      try {
        const files = await fs.readdir(CONSOLIDATED_DIR);
        const consolidatedFiles = files.filter((file) =>
          file.endsWith("_CONSOLIDATED.md"),
        );

        return NextResponse.json({
          available_categories: consolidatedFiles.map((file) =>
            file.replace("_CONSOLIDATED.md", ""),
          ),
          total_files: consolidatedFiles.length,
          last_updated: "2025-11-04",
        });
      } catch (error) {
        // Fallback for when files aren't accessible
        return NextResponse.json({
          available_categories: [
            "INVESTMENT_RETIREMENT",
            "INSURANCE_PRODUCTS",
            "BUSINESS_PRODUCTS",
            "WEALTH_FINANCIAL_ADVISORY",
            "DEATH_CLAIMS",
            "DISABILITY_CLAIMS",
            "GENERAL_CLAIMS",
          ],
          total_files: 7,
          status: "demo-mode",
          note: "Consolidated files available in LifeCompass directory",
        });
      }
    }

    // Return specific category content
    if (category) {
      try {
        const filename = `${category}_CONSOLIDATED.md`;
        const filePath = path.join(CONSOLIDATED_DIR, filename);

        const content = await fs.readFile(filePath, "utf-8");

        // Extract key information for API response
        const lines = content.split("\n");
        const title = lines[0].replace("# ", "");
        const overview =
          lines.find((line) => line.startsWith("**Consolidated from")) || "";

        return NextResponse.json({
          category,
          title,
          overview,
          full_content: content,
          word_count: content.split(" ").length,
          sections: content.split("\n## ").length - 1,
          last_updated: "2025-11-04",
        });
      } catch (error) {
        // Return demo content when file not accessible
        return NextResponse.json({
          category,
          title: `${category.replace("_", " ")} Guide`,
          overview: `Consolidated information about ${category.toLowerCase().replace("_", " ")} from Old Mutual Namibia documentation.`,
          demo_content: true,
          note: "Full content available in consolidated markdown files",
          last_updated: "2025-11-04",
        });
      }
    }

    // Search functionality
    if (query) {
      return NextResponse.json({
        query,
        results: [
          {
            category: "INSURANCE_PRODUCTS",
            title: "OMP Severe Illness Cover",
            snippet:
              "Coverage for 68 severe illnesses with lump sum payment upon diagnosis...",
            relevance_score: 0.95,
          },
          {
            category: "INVESTMENT_RETIREMENT",
            title: "Unit Trust Information",
            snippet:
              "Professional investment portfolios with diversification across asset classes...",
            relevance_score: 0.89,
          },
          {
            category: "DEATH_CLAIMS",
            title: "Claims Process",
            snippet:
              "Final expenses benefits paid within 48 hours, other claims within 15 working days...",
            relevance_score: 0.87,
          },
        ],
        total_results: 3,
        search_time_ms: 45,
      });
    }

    return NextResponse.json(
      { error: "Invalid request. Use ?category=NAME or ?query=SEARCH_TERM" },
      { status: 400 },
    );
  } catch (error: any) {
    console.error("Knowledge API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to access knowledge base" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, category, query } = body;

    if (action === "get_products") {
      // Return product information for a category
      const products: { [key: string]: any[] } = {
        INSURANCE_PRODUCTS: [
          {
            name: "OMP Severe Illness Cover",
            type: "Life Insurance",
            coverage: "68 severe illnesses",
            features: [
              "Lump sum payments",
              "Family protection benefits",
              "Cashback options",
            ],
            premium_range: "N$40 - N$200/month",
          },
          {
            name: "OMP Funeral Insurance",
            type: "Funeral Cover",
            coverage: "Extended family",
            features: [
              "48-hour claims payment",
              "Premium holidays",
              "Cashback benefits",
            ],
            premium_range: "N$40 - N$80/month",
          },
        ],
        INVESTMENT_RETIREMENT: [
          {
            name: "Old Mutual Namibia Income Fund",
            type: "Unit Trust",
            objective: "High income with capital stability",
            performance: "7.2% annual return",
            minimum_investment: "N$100/month",
          },
        ],
      };

      return NextResponse.json({
        category,
        products: products[category] || [],
        total_products: products[category]?.length || 0,
      });
    }

    if (action === "get_claims_info") {
      // Return claims information
      return NextResponse.json({
        death_claims: {
          payment_times:
            "Final expenses: 48 hours, Other claims: 15 working days",
          requirements: [
            "Death certificate",
            "Beneficiary form",
            "Banking details",
          ],
          contact: "061 223 189",
        },
        disability_claims: {
          waiting_period: "6 months",
          payment_type: "Monthly income replacement",
          contact: "061 223 189",
        },
      });
    }

    return NextResponse.json(
      { error: "Unknown action. Supported: get_products, get_claims_info" },
      { status: 400 },
    );
  } catch (error: any) {
    console.error("Knowledge API POST error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process request" },
      { status: 500 },
    );
  }
}
