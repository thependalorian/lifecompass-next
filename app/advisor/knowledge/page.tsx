// app/advisor/knowledge/page.tsx

"use client";

import { useState } from "react";
import { CorporateLayout } from "@/components/templates/CorporateLayout";
import { motion } from "framer-motion";
import { KnowledgeGraph } from "@/components/organisms/KnowledgeGraph";

const knowledgeCategories = [
  {
    id: "investments",
    name: "Investment & Retirement",
    count: 85,
    description: "Unit trusts, retirement plans, education savings, and investment strategies",
  },
  {
    id: "insurance",
    name: "Insurance Products",
    count: 72,
    description: "Life insurance, funeral cover, disability, and health insurance solutions",
  },
  {
    id: "business",
    name: "Business Solutions",
    count: 64,
    description: "Business insurance, employee benefits, and corporate financial planning",
  },
  {
    id: "wealth",
    name: "Wealth Management",
    count: 58,
    description: "Financial planning, wealth advisory, and life stage planning",
  },
  {
    id: "claims",
    name: "Claims & Processes",
    count: 43,
    description: "Claims procedures, forms, and processing guidelines",
  },
  {
    id: "health",
    name: "Health & Short-term",
    count: 36,
    description: "Medical aid, short-term insurance, and health-related products",
  },
];

const recentArticles = [
  {
    id: "ART-001",
    title: "Investment & Retirement Solutions Guide",
    category: "Investment & Retirement",
    date: "2025-11-04",
    views: 345,
    summary:
      "Comprehensive guide covering unit trusts, retirement plans, education savings, and investment strategies with complete fund details.",
  },
  {
    id: "ART-002",
    title: "Insurance Products Complete Reference",
    category: "Insurance Products",
    date: "2025-11-04",
    views: 298,
    summary:
      "Complete insurance product catalog including life insurance, funeral cover, disability, and health insurance with full policy details.",
  },
  {
    id: "ART-003",
    title: "Business Solutions & Employee Benefits",
    category: "Business Solutions",
    date: "2025-11-04",
    views: 267,
    summary:
      "Comprehensive business financial solutions including insurance, employee benefits, and corporate planning with detailed coverage.",
  },
  {
    id: "ART-004",
    title: "Wealth Management & Financial Planning",
    category: "Wealth Management",
    date: "2025-11-04",
    views: 189,
    summary:
      "Complete wealth management guide covering financial planning, investment advice, and life stage planning strategies.",
  },
  {
    id: "ART-005",
    title: "Claims Processing & Procedures",
    category: "Claims & Processes",
    date: "2025-11-04",
    views: 156,
    summary:
      "Detailed claims procedures for death, disability, and general claims with complete documentation requirements.",
  },
];

const popularSearches = [
  "Unit trust application forms",
  "Funeral insurance benefits",
  "Retirement annuity options",
  "Business key person insurance",
  "Disability claim procedures",
  "Education savings plans",
  "Life insurance premium calculation",
  "Business succession planning",
];

export default function AdvisorKnowledgePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showGraph, setShowGraph] = useState(false);

  return (
    <CorporateLayout
      heroTitle="Knowledge Base"
      heroSubtitle="Access product information, processes, and training resources"
      pageType="advisor"
      showBreadcrumbs={true}
      breadcrumbItems={[
        { label: "Advisor", href: "/advisor/select" },
        { label: "Dashboard", href: "/advisor" },
        { label: "Knowledge", href: "/advisor/knowledge" },
      ]}
    >
      {/* Search & Categories */}
      <section className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="opacity-90">
                Access product information, guides, and resources
              </p>
            </div>
            <button
              onClick={() => setShowGraph(!showGraph)}
              className="btn btn-outline btn-sm border-white/30 text-white hover:bg-white/20"
            >
              {showGraph ? "Hide" : "Show"} Knowledge Graph
            </button>
          </div>
      </section>

      {/* Knowledge Graph */}
      {showGraph && (
        <section className="container mx-auto px-4 py-8">
          <KnowledgeGraph showStats={true} />
        </section>
      )}

      {/* Search */}
      <section className="container mx-auto px-4 py-8">
        <div className="card-om p-6">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search knowledge base..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-bordered flex-1 input-om input-lg"
            />
            <button className="btn btn-om-primary btn-lg">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>

          {/* Popular Searches */}
          <div className="mt-4">
            <div className="text-sm text-om-grey mb-2">Popular searches:</div>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((search, idx) => (
                <button
                  key={idx}
                  onClick={() => setSearchQuery(search)}
                  className="badge badge-lg badge-outline hover:bg-om-green hover:text-white hover:border-om-green cursor-pointer"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 pb-6">
        <h2 className="text-xl font-bold text-om-navy mb-4">
          Browse by Category
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {knowledgeCategories.map((category, idx) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setSelectedCategory(category.id)}
              className="card-om cursor-pointer hover:shadow-xl transition-shadow"
            >
              <div className="card-body">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-4xl">
                    <svg
                      className="w-12 h-12 text-om-green"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <div className="badge badge-lg bg-om-green/10 text-om-green">
                    {category.count} articles
                  </div>
                </div>
                <h3 className="font-bold text-om-navy text-lg">
                  {category.name}
                </h3>
                <p className="text-sm text-om-grey">{category.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Recent Articles */}
      <section className="container mx-auto px-4 pb-6">
        <h2 className="text-xl font-bold text-om-navy mb-4">Recent Updates</h2>
        <div className="space-y-4">
          {recentArticles.map((article) => (
            <div key={article.id} className="card-om">
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-om-navy">
                        {article.title}
                      </h3>
                      <div className="badge badge-sm">{article.category}</div>
                    </div>
                    <p className="text-om-grey mb-3">{article.summary}</p>
                    <div className="flex items-center gap-4 text-sm text-om-grey">
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {article.date}
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        {article.views} views
                      </div>
                    </div>
                  </div>

                  <button className="btn btn-sm btn-om-primary">
                    Read Article
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Links */}
      <section className="container mx-auto px-4 pb-20">
        <h2 className="text-xl font-bold text-om-navy mb-4">Quick Links</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="card-om hover:shadow-xl transition-shadow cursor-pointer">
            <div className="card-body items-center text-center">
              <svg
                className="w-12 h-12 text-om-green mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="font-bold text-om-navy">Product Catalog</h3>
            </div>
          </div>

          <div className="card-om hover:shadow-xl transition-shadow cursor-pointer">
            <div className="card-body items-center text-center">
              <svg
                className="w-12 h-12 text-om-navy mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="font-bold text-om-navy">Forms Library</h3>
            </div>
          </div>

          <div className="card-om hover:shadow-xl transition-shadow cursor-pointer">
            <div className="card-body items-center text-center">
              <svg
                className="w-12 h-12 text-om-gold mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <h3 className="font-bold text-om-navy">Training Videos</h3>
            </div>
          </div>

          <div className="card-om hover:shadow-xl transition-shadow cursor-pointer">
            <div className="card-body items-center text-center">
              <svg
                className="w-12 h-12 text-om-green mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="font-bold text-om-navy">FAQ</h3>
            </div>
          </div>
        </div>
      </section>
    </CorporateLayout>
  );
}
