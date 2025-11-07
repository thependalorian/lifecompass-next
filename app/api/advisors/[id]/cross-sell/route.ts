// app/api/advisors/[id]/cross-sell/route.ts
// API endpoint for calculating cross-sell opportunities for advisor's clients

import { NextRequest, NextResponse } from "next/server";
import { getAdvisorClients, getAdvisorByNumber, getCustomerPolicies } from "@/lib/db/neon";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Product recommendations based on customer profile
const PRODUCT_RECOMMENDATIONS: Record<string, string[]> = {
  "Life Insurance": ["Funeral Cover", "Disability Cover", "Education Savings", "Retirement Annuity"],
  "Funeral Cover": ["Life Insurance", "Disability Cover", "Education Savings"],
  "Motor Insurance": ["Business Insurance", "Home Insurance", "Life Insurance"],
  "Home Insurance": ["Motor Insurance", "Business Insurance", "Life Insurance"],
  "Business Insurance": ["Life Insurance", "Retirement Annuity", "Disability Cover"],
  "Education Savings": ["Life Insurance", "Retirement Annuity", "Funeral Cover"],
  "Retirement Annuity": ["Life Insurance", "Disability Cover", "Education Savings"],
  "Disability Cover": ["Life Insurance", "Funeral Cover", "Retirement Annuity"],
};

// Calculate probability based on customer profile
function calculateProbability(
  customer: any,
  currentProducts: string[],
  recommendedProduct: string
): number {
  let probability = 50; // Base probability

  // Increase probability based on engagement score
  if (customer.engagementScore > 70) probability += 15;
  else if (customer.engagementScore > 50) probability += 10;
  else if (customer.engagementScore > 30) probability += 5;

  // Increase probability based on lifetime value
  if (customer.lifetimeValue > 50000) probability += 10;
  else if (customer.lifetimeValue > 20000) probability += 5;

  // Increase probability if customer has multiple products (more engaged)
  if (currentProducts.length >= 2) probability += 10;
  else if (currentProducts.length === 1) probability += 5;

  // Segment-based adjustments
  if (customer.segment === "Professional" || customer.segment === "Corporate") {
    if (recommendedProduct.includes("Retirement") || recommendedProduct.includes("Business")) {
      probability += 10;
    }
  } else if (customer.segment === "Informal Sector") {
    if (recommendedProduct.includes("Funeral") || recommendedProduct.includes("Education")) {
      probability += 10;
    }
  }

  // Reduce probability if churn risk is high
  if (customer.churnRisk === "High") probability -= 15;
  else if (customer.churnRisk === "Medium") probability -= 5;

  return Math.min(95, Math.max(30, probability));
}

// Estimate potential revenue based on product and customer segment
function estimateRevenue(product: string, segment: string): number {
  const baseRevenue: Record<string, number> = {
    "Life Insurance": 3000,
    "Funeral Cover": 1200,
    "Motor Insurance": 2400,
    "Home Insurance": 1800,
    "Business Insurance": 8400,
    "Education Savings": 3600,
    "Retirement Annuity": 4800,
    "Disability Cover": 2100,
  };

  const revenue = baseRevenue[product] || 2000;

  // Adjust based on segment
  const multipliers: Record<string, number> = {
    "Corporate": 1.5,
    "Professional": 1.3,
    "Small Business": 1.1,
    "Informal Sector": 0.8,
  };

  return Math.round(revenue * (multipliers[segment] || 1.0));
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const advisorIdOrNumber = params.id;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    // Resolve advisor ID
    let advisorId: string;
    if (advisorIdOrNumber.startsWith("ADV-")) {
      const advisor = await getAdvisorByNumber(advisorIdOrNumber);
      if (!advisor) {
        return NextResponse.json(
          { error: "Advisor not found" },
          { status: 404 }
        );
      }
      advisorId = advisor.id;
    } else {
      advisorId = advisorIdOrNumber;
    }

    // Get advisor's clients
    const clients = await getAdvisorClients(advisorId, 100);

    // Calculate cross-sell opportunities
    const opportunities: Array<{
      clientId: string;
      customerNumber: string;
      clientName: string;
      currentProducts: string[];
      recommendedProduct: string;
      probability: number;
      potentialRevenue: number;
    }> = [];

    for (const client of clients) {
      // Get client's current policies
      const policies = await getCustomerPolicies(client.id);
      const currentProducts = policies
        .map((p: any) => p.product_type || p.product_subtype)
        .filter((p: string) => p && p !== "Unknown")
        .filter((value: string, index: number, self: string[]) => self.indexOf(value) === index); // Remove duplicates

      if (currentProducts.length === 0) continue;

      // Find recommended products based on current products
      const recommendedProducts = new Set<string>();
      currentProducts.forEach((product: string) => {
        const recommendations = PRODUCT_RECOMMENDATIONS[product] || [];
        recommendations.forEach((rec) => {
          // Only recommend if customer doesn't already have it
          if (!currentProducts.includes(rec)) {
            recommendedProducts.add(rec);
          }
        });
      });

      // If no recommendations from current products, suggest based on segment
      if (recommendedProducts.size === 0) {
        if (client.segment === "Professional" || client.segment === "Corporate") {
          recommendedProducts.add("Retirement Annuity");
          recommendedProducts.add("Business Insurance");
        } else if (client.segment === "Informal Sector") {
          recommendedProducts.add("Funeral Cover");
          recommendedProducts.add("Education Savings");
        } else {
          recommendedProducts.add("Life Insurance");
          recommendedProducts.add("Disability Cover");
        }
      }

      // Create opportunity for each recommended product
      recommendedProducts.forEach((product) => {
        const probability = calculateProbability(client, currentProducts, product);
        const potentialRevenue = estimateRevenue(product, client.segment || "Informal Sector");

        opportunities.push({
          clientId: client.id,
          customerNumber: client.customer_number,
          clientName: `${client.first_name} ${client.last_name}`,
          currentProducts,
          recommendedProduct: product,
          probability: Math.round(probability),
          potentialRevenue,
        });
      });
    }

    // Sort by probability (highest first) and limit
    opportunities.sort((a, b) => b.probability - a.probability);
    const topOpportunities = opportunities.slice(0, limit);

    return NextResponse.json(topOpportunities);
  } catch (error) {
    console.error("Error calculating cross-sell opportunities:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Failed to calculate cross-sell opportunities",
        message: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

