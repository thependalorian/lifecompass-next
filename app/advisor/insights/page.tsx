// app/advisor/insights/page.tsx

"use client";

import { useState } from "react";
import { CorporateLayout } from "@/components/templates/CorporateLayout";
import { motion } from "framer-motion";

const performanceData = {
  thisMonth: {
    newClients: 12,
    policiesSold: 18,
    premiumGenerated: 62000,
    conversions: 78,
    avgResponseTime: 2.3,
    clientSatisfaction: 4.9,
  },
  lastMonth: {
    newClients: 10,
    policiesSold: 15,
    premiumGenerated: 54000,
    conversions: 72,
    avgResponseTime: 2.8,
    clientSatisfaction: 4.7,
  },
};

const topProducts = [
  { name: "Life Insurance", sales: 8, revenue: 28000, growth: 15 },
  { name: "Funeral Cover", sales: 12, revenue: 18000, growth: 25 },
  { name: "Investment Plans", sales: 5, revenue: 16000, growth: -5 },
  { name: "Motor Insurance", sales: 6, revenue: 12000, growth: 10 },
];

const clientSegments = [
  { segment: "Informal Sector", count: 78, percentage: 60, avgPremium: 450 },
  { segment: "Small Business", count: 32, percentage: 25, avgPremium: 1200 },
  { segment: "Professional", count: 13, percentage: 10, avgPremium: 3200 },
  { segment: "Corporate", count: 7, percentage: 5, avgPremium: 5500 },
];

const crossSellOpportunities = [
  {
    client: "Maria Shikongo",
    currentProducts: ["Life Insurance", "Funeral Cover"],
    recommendedProduct: "Education Savings",
    probability: 85,
    potentialRevenue: 3600,
  },
  {
    client: "John-Paul !Gaeb",
    currentProducts: ["Motor Insurance"],
    recommendedProduct: "Business Insurance",
    probability: 72,
    potentialRevenue: 8400,
  },
  {
    client: "Fatima Isaacks",
    currentProducts: ["Life Insurance", "Funeral Cover"],
    recommendedProduct: "Retirement Annuity",
    probability: 68,
    potentialRevenue: 4800,
  },
];

export default function AdvisorInsightsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("thisMonth");

  const calculateChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return change.toFixed(1);
  };

  return (
    <CorporateLayout
      heroTitle="Analytics & Insights"
      heroSubtitle="Track your performance and discover opportunities"
      pageType="advisor"
    >

      {/* Period Selector */}
      <section className="container mx-auto px-4 py-6">
        <div className="flex gap-4">
          <button
            onClick={() => setSelectedPeriod("thisMonth")}
            className={`btn ${selectedPeriod === "thisMonth" ? "btn-om-primary" : "btn-outline"}`}
          >
            This Month
          </button>
          <button
            onClick={() => setSelectedPeriod("lastMonth")}
            className={`btn ${selectedPeriod === "lastMonth" ? "btn-om-primary" : "btn-outline"}`}
          >
            Last Month
          </button>
          <button className="btn btn-outline">Last Quarter</button>
          <button className="btn btn-outline">Year to Date</button>
        </div>
      </section>

      {/* Performance Metrics */}
      <section className="container mx-auto px-4 pb-6">
        <h2 className="text-xl font-bold text-om-navy mb-4">
          Performance Overview
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-om"
          >
            <div className="card-body">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-om-grey">New Clients</div>
                <div
                  className={`badge ${
                    performanceData.thisMonth.newClients >
                    performanceData.lastMonth.newClients
                      ? "badge-success"
                      : "badge-error"
                  }`}
                >
                  {calculateChange(
                    performanceData.thisMonth.newClients,
                    performanceData.lastMonth.newClients,
                  )}
                  %
                </div>
              </div>
              <div className="text-4xl font-bold text-om-green">
                {performanceData.thisMonth.newClients}
              </div>
              <div className="text-xs text-om-grey">
                vs {performanceData.lastMonth.newClients} last month
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-om"
          >
            <div className="card-body">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-om-grey">Policies Sold</div>
                <div
                  className={`badge ${
                    performanceData.thisMonth.policiesSold >
                    performanceData.lastMonth.policiesSold
                      ? "badge-success"
                      : "badge-error"
                  }`}
                >
                  {calculateChange(
                    performanceData.thisMonth.policiesSold,
                    performanceData.lastMonth.policiesSold,
                  )}
                  %
                </div>
              </div>
              <div className="text-4xl font-bold text-om-navy">
                {performanceData.thisMonth.policiesSold}
              </div>
              <div className="text-xs text-om-grey">
                vs {performanceData.lastMonth.policiesSold} last month
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-om"
          >
            <div className="card-body">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-om-grey">Premium Generated</div>
                <div
                  className={`badge ${
                    performanceData.thisMonth.premiumGenerated >
                    performanceData.lastMonth.premiumGenerated
                      ? "badge-success"
                      : "badge-error"
                  }`}
                >
                  {calculateChange(
                    performanceData.thisMonth.premiumGenerated,
                    performanceData.lastMonth.premiumGenerated,
                  )}
                  %
                </div>
              </div>
              <div className="text-4xl font-bold text-om-gold">
                N${performanceData.thisMonth.premiumGenerated.toLocaleString()}
              </div>
              <div className="text-xs text-om-grey">
                vs N$
                {performanceData.lastMonth.premiumGenerated.toLocaleString()}{" "}
                last month
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card-om"
          >
            <div className="card-body">
              <div className="text-sm text-om-grey mb-2">Conversion Rate</div>
              <div className="text-4xl font-bold text-om-green">
                {performanceData.thisMonth.conversions}%
              </div>
              <div className="text-xs text-om-grey">
                vs {performanceData.lastMonth.conversions}% last month
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card-om"
          >
            <div className="card-body">
              <div className="text-sm text-om-grey mb-2">Avg Response Time</div>
              <div className="text-4xl font-bold text-om-navy">
                {performanceData.thisMonth.avgResponseTime}h
              </div>
              <div className="text-xs text-om-grey">
                vs {performanceData.lastMonth.avgResponseTime}h last month
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card-om"
          >
            <div className="card-body">
              <div className="text-sm text-om-grey mb-2">
                Client Satisfaction
              </div>
              <div className="text-4xl font-bold text-om-gold">
                {performanceData.thisMonth.clientSatisfaction}
              </div>
              <div className="rating rating-sm mt-2">
                {[...Array(5)].map((_, i) => (
                  <input
                    key={i}
                    type="radio"
                    className="mask mask-star-2 bg-om-gold"
                    checked={
                      i <
                      Math.floor(performanceData.thisMonth.clientSatisfaction)
                    }
                    readOnly
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Product Performance */}
      <section className="container mx-auto px-4 pb-6">
        <h2 className="text-xl font-bold text-om-navy mb-4">Top Products</h2>
        <div className="card-om">
          <div className="card-body">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Sales</th>
                    <th>Revenue</th>
                    <th>Growth</th>
                    <th>Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product, idx) => (
                    <tr key={idx}>
                      <td className="font-semibold">{product.name}</td>
                      <td>{product.sales}</td>
                      <td className="font-bold text-om-green">
                        N${product.revenue.toLocaleString()}
                      </td>
                      <td>
                        <div
                          className={`badge ${
                            product.growth > 0 ? "badge-success" : "badge-error"
                          }`}
                        >
                          {product.growth > 0 ? "+" : ""}
                          {product.growth}%
                        </div>
                      </td>
                      <td>
                        <div className="w-full bg-base-200 rounded-full h-2">
                          <div
                            className="bg-om-green h-2 rounded-full"
                            style={{ width: `${(product.sales / 12) * 100}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Client Segments */}
      <section className="container mx-auto px-4 pb-6">
        <h2 className="text-xl font-bold text-om-navy mb-4">Client Segments</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card-om">
            <div className="card-body">
              <h3 className="font-bold text-om-navy mb-4">Distribution</h3>
              <div className="space-y-4">
                {clientSegments.map((segment, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold">{segment.segment}</span>
                      <span className="text-om-grey">
                        {segment.count} clients ({segment.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-base-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-om-green to-om-navy h-3 rounded-full"
                        style={{ width: `${segment.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card-om">
            <div className="card-body">
              <h3 className="font-bold text-om-navy mb-4">
                Average Premium by Segment
              </h3>
              <div className="space-y-3">
                {clientSegments.map((segment, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-base-200 rounded-lg"
                  >
                    <div>
                      <div className="font-semibold">{segment.segment}</div>
                      <div className="text-xs text-om-grey">
                        {segment.count} clients
                      </div>
                    </div>
                    <div className="text-xl font-bold text-om-green">
                      N${segment.avgPremium}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cross-Sell Opportunities */}
      <section className="container mx-auto px-4 pb-20">
        <h2 className="text-xl font-bold text-om-navy mb-4">
          Cross-Sell Opportunities
        </h2>
        <div className="card-om">
          <div className="card-body">
            <div className="space-y-4">
              {crossSellOpportunities.map((opportunity, idx) => (
                <div key={idx} className="p-4 bg-base-200 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-bold text-om-navy">
                        {opportunity.client}
                      </div>
                      <div className="text-sm text-om-grey">
                        Current: {opportunity.currentProducts.join(", ")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-om-grey">Probability</div>
                      <div className="text-2xl font-bold text-om-green">
                        {opportunity.probability}%
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-om-grey">
                        Recommended Product
                      </div>
                      <div className="font-semibold">
                        {opportunity.recommendedProduct}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-om-grey">
                        Potential Annual Revenue
                      </div>
                      <div className="text-lg font-bold text-om-gold">
                        N${opportunity.potentialRevenue.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button className="btn btn-sm btn-om-primary">
                      Contact Client
                    </button>
                    <button className="btn btn-sm btn-om-outline">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </CorporateLayout>
  );
}
