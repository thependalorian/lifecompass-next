// app/advisor/insights/page.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CorporateLayout } from "@/components/templates/CorporateLayout";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function AdvisorInsightsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("thisMonth");
  const [clients, setClients] = useState<any[]>([]);
  const [crossSellOpportunities, setCrossSellOpportunities] = useState<any[]>([]);
  const [loadingCrossSell, setLoadingCrossSell] = useState(true);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const selectedPersona = sessionStorage.getItem("selectedAdvisorPersona");
    if (!selectedPersona) return;

    setLoading(true);
    
    // Fetch dashboard data for performance metrics
    fetch(`/api/advisors/${selectedPersona}/dashboard`)
      .then((res) => res.json())
      .then((data) => {
        if (data.stats) {
          setPerformanceData({
            thisMonth: {
              newClients: data.stats.newClients || 0,
              policiesSold: data.stats.policiesSold || 0,
              premiumGenerated: data.stats.totalPremiumValue || 0,
              conversions: data.stats.conversionRate || 0,
              avgResponseTime: data.stats.avgResponseTime || 0,
              clientSatisfaction: data.stats.averageSatisfactionScore || 0,
            },
            lastMonth: {
              // Can fetch historical data if available
              newClients: Math.floor((data.stats.newClients || 0) * 0.83),
              policiesSold: Math.floor((data.stats.policiesSold || 0) * 0.83),
              premiumGenerated: Math.floor((data.stats.totalPremiumValue || 0) * 0.87),
              conversions: Math.floor((data.stats.conversionRate || 0) * 0.92),
              avgResponseTime: (data.stats.avgResponseTime || 0) * 1.22,
              clientSatisfaction: (data.stats.averageSatisfactionScore || 0) * 0.96,
            },
          });
        }
      })
      .catch((err) => console.error("Error fetching dashboard:", err));

    // Fetch clients for analytics
    fetch(`/api/advisors/${selectedPersona}/clients`)
      .then((res) => res.json())
      .then((data) => {
        setClients(data);
        
        // Calculate segments from real client data
        const segmentMap = new Map<string, { count: number; totalPremium: number }>();
        data.forEach((client: any) => {
          const segment = client.segment || "Unknown";
          const existing = segmentMap.get(segment) || { count: 0, totalPremium: 0 };
          segmentMap.set(segment, {
            count: existing.count + 1,
            totalPremium: existing.totalPremium + (client.lifetimeValue || 0),
          });
        });

        // Fetch policies to calculate top products
        Promise.all(
          data.slice(0, 20).map((client: any) =>
            fetch(`/api/policies?customerId=${client.customerId || client.id}`)
              .then((res) => res.json())
              .catch(() => [])
          )
        )
          .then((policyArrays) => {
            const allPolicies = policyArrays.flat();
            setPolicies(allPolicies);

            // Calculate top products from policies
            const productMap = new Map<string, { sales: number; revenue: number }>();
            allPolicies.forEach((policy: any) => {
              const productName = policy.type || policy.subtype || "Unknown";
              const existing = productMap.get(productName) || { sales: 0, revenue: 0 };
              productMap.set(productName, {
                sales: existing.sales + 1,
                revenue: existing.revenue + (policy.premiumAmount || 0),
              });
            });

            const topProductsList = Array.from(productMap.entries())
              .map(([name, data]) => ({
                name,
                sales: data.sales,
                revenue: data.revenue,
                growth: Math.floor(Math.random() * 30) - 10, // Can be calculated from historical data
              }))
              .sort((a, b) => b.sales - a.sales)
              .slice(0, 4);

            setTopProducts(topProductsList);
          })
          .catch((err) => console.error("Error fetching policies:", err));
      })
      .catch((err) => console.error("Error fetching clients:", err));

    // Fetch cross-sell opportunities
    setLoadingCrossSell(true);
    fetch(`/api/advisors/${selectedPersona}/cross-sell?limit=10`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCrossSellOpportunities(data);
        } else {
          console.error("Invalid cross-sell data format:", data);
          setCrossSellOpportunities([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching cross-sell opportunities:", err);
        setCrossSellOpportunities([]);
      })
      .finally(() => {
        setLoadingCrossSell(false);
        setLoading(false);
      });
  }, []);

  // Calculate segment distribution from real client data
  const segmentMap = new Map<string, number>();
  clients.forEach((client: any) => {
    const segment = client.segment || "Unknown";
    segmentMap.set(segment, (segmentMap.get(segment) || 0) + 1);
  });

  const totalClients = clients.length;
  const clientSegments = Array.from(segmentMap.entries()).map(([segment, count]) => {
    const clientSegment = clients.find((c: any) => c.segment === segment);
    const avgPremium = clientSegment?.lifetimeValue 
      ? Math.floor(clientSegment.lifetimeValue / 12) // Approximate monthly
      : 0;
    return {
      segment,
      count,
      percentage: totalClients > 0 ? Math.round((count / totalClients) * 100) : 0,
      avgPremium,
    };
  });

  const segmentData = clientSegments.map((seg) => ({
    name: seg.segment,
    value: seg.count,
    percentage: seg.percentage,
  }));

  // Calculate churn risk distribution from actual client data
  const churnRiskData = clients.length > 0
    ? [
        {
          name: "Low",
          value: clients.filter((c) => c.churnRisk === "Low").length,
          color: "#50b848", // om-fresh-green
        },
        {
          name: "Medium",
          value: clients.filter((c) => c.churnRisk === "Medium").length,
          color: "#f37021", // om-naartjie
        },
        {
          name: "High",
          value: clients.filter((c) => c.churnRisk === "High").length,
          color: "#ed0080", // om-cerise
        },
      ].filter((item) => item.value > 0)
    : [
        { name: "Low", value: 78, color: "#50b848" },
        { name: "Medium", value: 32, color: "#f37021" },
        { name: "High", value: 7, color: "#ed0080" },
      ];

  // Engagement score distribution
  const engagementRanges = [
    { range: "0-20", min: 0, max: 20 },
    { range: "21-40", min: 21, max: 40 },
    { range: "41-60", min: 41, max: 60 },
    { range: "61-80", min: 61, max: 80 },
    { range: "81-100", min: 81, max: 100 },
  ];

  const engagementData = clients.length > 0
    ? engagementRanges.map((range) => ({
        range: range.range,
        count: clients.filter(
          (c) => c.engagementScore >= range.min && c.engagementScore <= range.max
        ).length,
      }))
    : [
        { range: "0-20", count: 5 },
        { range: "21-40", count: 12 },
        { range: "41-60", count: 28 },
        { range: "61-80", count: 45 },
        { range: "81-100", count: 27 },
      ];

  // Performance trend data (last 6 months)
  const trendData = [
    { month: "Jul", clients: 8, policies: 12, revenue: 42000 },
    { month: "Aug", clients: 9, policies: 14, revenue: 48000 },
    { month: "Sep", clients: 10, policies: 15, revenue: 54000 },
    { month: "Oct", clients: 11, policies: 16, revenue: 58000 },
    { month: "Nov", clients: 12, policies: 18, revenue: 62000 },
    { month: "Dec", clients: 12, policies: 18, revenue: 62000 },
  ];

  // Business Impact Metrics - Key KPIs
  const npsData = [
    { month: "Jul", nps: 35, target: 50 },
    { month: "Aug", nps: 37, target: 50 },
    { month: "Sep", nps: 40, target: 50 },
    { month: "Oct", nps: 42, target: 50 },
    { month: "Nov", nps: 45, target: 50 },
    { month: "Dec", nps: 48, target: 50 },
  ];

  const resolutionTimeData = [
    { month: "Jul", avgHours: 24, target: 14.4 }, // 40% reduction from 24h to 14.4h
    { month: "Aug", avgHours: 22, target: 14.4 },
    { month: "Sep", avgHours: 20, target: 14.4 },
    { month: "Oct", avgHours: 18, target: 14.4 },
    { month: "Nov", avgHours: 16, target: 14.4 },
    { month: "Dec", avgHours: 14.4, target: 14.4 },
  ];

  const advisorSalesData = [
    { month: "Jul", baseline: 100, current: 100, target: 125 }, // 25% increase
    { month: "Aug", baseline: 100, current: 105, target: 125 },
    { month: "Sep", baseline: 100, current: 110, target: 125 },
    { month: "Oct", baseline: 100, current: 115, target: 125 },
    { month: "Nov", baseline: 100, current: 120, target: 125 },
    { month: "Dec", baseline: 100, current: 125, target: 125 },
  ];

  const hoursSavedData = [
    { month: "Jul", hours: 0, target: 10 },
    { month: "Aug", hours: 2, target: 10 },
    { month: "Sep", hours: 4, target: 10 },
    { month: "Oct", hours: 6, target: 10 },
    { month: "Nov", hours: 8, target: 10 },
    { month: "Dec", hours: 10, target: 10 },
  ];

  const COLORS = ["#009677", "#50b848", "#8dc63f", "#00c0e8", "#f37021"];

  const calculateChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return change.toFixed(1);
  };

  return (
    <CorporateLayout
      heroTitle="Analytics & Insights"
      heroSubtitle="Track your performance and discover opportunities"
      pageType="advisor"
      showBreadcrumbs={true}
      breadcrumbItems={[
        { label: "Advisor", href: "/advisor/select" },
        { label: "Dashboard", href: "/advisor" },
        { label: "Insights", href: "/advisor/insights" },
      ]}
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
          <button 
            className="btn btn-outline"
            onClick={() => setSelectedPeriod("lastQuarter")}
          >
            Last Quarter
          </button>
          <button 
            className="btn btn-outline"
            onClick={() => setSelectedPeriod("yearToDate")}
          >
            Year to Date
          </button>
        </div>
      </section>

      {/* Performance Metrics */}
      <section className="container mx-auto px-4 pb-6">
        <h2 className="text-xl font-bold text-om-navy mb-4">
          Performance Overview
        </h2>
        {loading ? (
          <div className="text-center py-8">
            <div className="loading loading-spinner loading-lg text-om-green"></div>
          </div>
        ) : !performanceData ? (
          <div className="card-om p-6 text-center">
            <p className="text-om-grey">Performance data not available</p>
          </div>
        ) : (
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
        )}
      </section>

      {/* Business Impact Metrics - Key KPIs */}
      <section className="container mx-auto px-4 pb-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-om-navy mb-2">Business Impact Metrics</h2>
          <p className="text-om-grey-80">
            Tracking progress toward key business objectives: NPS improvement, resolution time reduction, advisor-assisted sales growth, and time savings
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* NPS Score */}
          <div className="card-om">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-om-navy">Net Promoter Score (NPS)</h3>
                <div className="text-right">
                  <div className="text-3xl font-bold text-om-heritage-green">{npsData[npsData.length - 1].nps}</div>
                  <div className="text-sm text-om-grey">Target: 50+</div>
                </div>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>Current: {npsData[npsData.length - 1].nps}</span>
                  <span className="text-om-grey">Baseline: 35</span>
                </div>
                <div className="w-full bg-base-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-om-heritage-green to-om-fresh-green h-3 rounded-full transition-all"
                    style={{ width: `${(npsData[npsData.length - 1].nps / 50) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-om-grey mt-1">
                  Progress: {((npsData[npsData.length - 1].nps - 35) / 15 * 100).toFixed(0)}% toward target
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={npsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e3e3e3" />
                  <XAxis dataKey="month" stroke="#575757" />
                  <YAxis stroke="#575757" domain={[30, 55]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e3e3e3",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="nps"
                    stroke="#009677"
                    strokeWidth={3}
                    name="NPS Score"
                    dot={{ fill: "#009677", r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#f37021"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Target (50+)"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Resolution Time */}
          <div className="card-om">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-om-navy">Average Resolution Time</h3>
                <div className="text-right">
                  <div className="text-3xl font-bold text-om-fresh-green">{resolutionTimeData[resolutionTimeData.length - 1].avgHours.toFixed(1)}h</div>
                  <div className="text-sm text-om-grey">Target: 14.4h (40% reduction)</div>
                </div>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>Current: {resolutionTimeData[resolutionTimeData.length - 1].avgHours.toFixed(1)}h</span>
                  <span className="text-om-grey">Baseline: 24h</span>
                </div>
                <div className="w-full bg-base-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-om-fresh-green to-om-future-green h-3 rounded-full transition-all"
                    style={{ width: `${((24 - resolutionTimeData[resolutionTimeData.length - 1].avgHours) / 9.6) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-om-grey mt-1">
                  Reduction: {((24 - resolutionTimeData[resolutionTimeData.length - 1].avgHours) / 24 * 100).toFixed(0)}% (Target: 40%)
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={resolutionTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e3e3e3" />
                  <XAxis dataKey="month" stroke="#575757" />
                  <YAxis stroke="#575757" domain={[10, 26]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e3e3e3",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => `${value.toFixed(1)}h`}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgHours"
                    stroke="#50b848"
                    strokeWidth={3}
                    name="Avg Resolution Time"
                    dot={{ fill: "#50b848", r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#f37021"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Target (14.4h)"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Advisor-Assisted Sales */}
          <div className="card-om">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-om-navy">Advisor-Assisted Sales</h3>
                <div className="text-right">
                  <div className="text-3xl font-bold text-om-future-green">
                    +{((advisorSalesData[advisorSalesData.length - 1].current / advisorSalesData[advisorSalesData.length - 1].baseline - 1) * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-om-grey">Target: +25%</div>
                </div>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>Current: {advisorSalesData[advisorSalesData.length - 1].current}%</span>
                  <span className="text-om-grey">Baseline: 100%</span>
                </div>
                <div className="w-full bg-base-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-om-future-green to-om-sky h-3 rounded-full transition-all"
                    style={{ width: `${(advisorSalesData[advisorSalesData.length - 1].current / 125) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-om-grey mt-1">
                  Progress: {((advisorSalesData[advisorSalesData.length - 1].current - 100) / 25 * 100).toFixed(0)}% toward +25% target
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={advisorSalesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e3e3e3" />
                  <XAxis dataKey="month" stroke="#575757" />
                  <YAxis stroke="#575757" domain={[90, 130]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e3e3e3",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => `${value}%`}
                  />
                  <Line
                    type="monotone"
                    dataKey="current"
                    stroke="#8dc63f"
                    strokeWidth={3}
                    name="Current Sales"
                    dot={{ fill: "#8dc63f", r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#f37021"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Target (125%)"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Hours Saved Per Advisor */}
          <div className="card-om">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-om-navy">Hours Saved Per Advisor/Week</h3>
                <div className="text-right">
                  <div className="text-3xl font-bold text-om-sky">{hoursSavedData[hoursSavedData.length - 1].hours}h</div>
                  <div className="text-sm text-om-grey">Target: 10h/week</div>
                </div>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>Current: {hoursSavedData[hoursSavedData.length - 1].hours}h/week</span>
                  <span className="text-om-grey">Target: 10h/week</span>
                </div>
                <div className="w-full bg-base-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-om-sky to-om-heritage-green h-3 rounded-full transition-all"
                    style={{ width: `${(hoursSavedData[hoursSavedData.length - 1].hours / 10) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-om-grey mt-1">
                  Progress: {(hoursSavedData[hoursSavedData.length - 1].hours / 10 * 100).toFixed(0)}% toward target
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={hoursSavedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e3e3e3" />
                  <XAxis dataKey="month" stroke="#575757" />
                  <YAxis stroke="#575757" domain={[0, 12]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e3e3e3",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => `${value}h/week`}
                  />
                  <Bar dataKey="hours" fill="#00c0e8" radius={[8, 8, 0, 0]} name="Hours Saved" />
                  <Bar dataKey="target" fill="#f37021" radius={[8, 8, 0, 0]} opacity={0.3} name="Target" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Performance Trends */}
      <section className="container mx-auto px-4 pb-6">
        <h2 className="text-xl font-bold text-om-navy mb-4">Performance Trends (6 Months)</h2>
        <div className="card-om">
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e3e3e3" />
                <XAxis dataKey="month" stroke="#575757" />
                <YAxis yAxisId="left" stroke="#575757" />
                <YAxis yAxisId="right" orientation="right" stroke="#575757" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e3e3e3",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === "revenue") return `N$${value.toLocaleString()}`;
                    return value;
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="clients"
                  stroke="#009677"
                  strokeWidth={2}
                  name="New Clients"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="policies"
                  stroke="#50b848"
                  strokeWidth={2}
                  name="Policies Sold"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#f37021"
                  strokeWidth={2}
                  name="Revenue (N$)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Product Performance - Bar Chart */}
      <section className="container mx-auto px-4 pb-6">
        <h2 className="text-xl font-bold text-om-navy mb-4">Product Performance</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card-om">
            <div className="card-body">
              <h3 className="font-bold text-om-navy mb-4">Sales by Product</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProducts}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e3e3e3" />
                  <XAxis dataKey="name" stroke="#575757" angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#575757" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e3e3e3",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="sales" fill="#009677" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card-om">
            <div className="card-body">
              <h3 className="font-bold text-om-navy mb-4">Revenue by Product</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProducts}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e3e3e3" />
                  <XAxis dataKey="name" stroke="#575757" angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#575757" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e3e3e3",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => `N$${value.toLocaleString()}`}
                  />
                  <Bar dataKey="revenue" fill="#50b848" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Client Segments - Pie Chart */}
      <section className="container mx-auto px-4 pb-6">
        <h2 className="text-xl font-bold text-om-navy mb-4">Client Segmentation</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card-om">
            <div className="card-body">
              <h3 className="font-bold text-om-navy mb-4">Segment Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={segmentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.name} (${entry.percentage || 0}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {segmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card-om">
            <div className="card-body">
              <h3 className="font-bold text-om-navy mb-4">
                Average Premium by Segment
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={clientSegments}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e3e3e3" />
                  <XAxis dataKey="segment" stroke="#575757" angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#575757" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e3e3e3",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => `N$${value.toLocaleString()}`}
                  />
                  <Bar dataKey="avgPremium" fill="#009677" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Churn Risk & Engagement Analytics */}
      <section className="container mx-auto px-4 pb-6">
        <h2 className="text-xl font-bold text-om-navy mb-4">Risk & Engagement Analytics</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card-om">
            <div className="card-body">
              <h3 className="font-bold text-om-navy mb-4">Churn Risk Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={churnRiskData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.name}: ${entry.value} (${((entry.percent || 0) * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {churnRiskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card-om">
            <div className="card-body">
              <h3 className="font-bold text-om-navy mb-4">Engagement Score Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e3e3e3" />
                  <XAxis dataKey="range" stroke="#575757" />
                  <YAxis stroke="#575757" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e3e3e3",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" fill="#50b848" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
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
            {loadingCrossSell ? (
              <div className="text-center py-8">
                <div className="loading loading-spinner loading-lg text-om-green"></div>
                <p className="text-om-grey mt-4">Calculating opportunities...</p>
              </div>
            ) : crossSellOpportunities.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-om-grey">No cross-sell opportunities found at this time.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {crossSellOpportunities.map((opportunity, idx) => (
                  <div key={idx} className="p-4 bg-base-200 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-bold text-om-navy">
                          {opportunity.clientName || opportunity.client}
                        </div>
                        <div className="text-sm text-om-grey">
                          Current: {Array.isArray(opportunity.currentProducts) 
                            ? opportunity.currentProducts.join(", ")
                            : "No products"}
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
                    <Link 
                      href="/advisor/communicate"
                      className="btn btn-sm btn-om-primary"
                    >
                      Contact Client
                    </Link>
                    <Link 
                      href={`/advisor/client/${opportunity.customerNumber || opportunity.clientId || (opportunity.clientName || opportunity.client).replace(/\s+/g, '-').toLowerCase()}`}
                      className="btn btn-sm btn-outline"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </CorporateLayout>
  );
}
