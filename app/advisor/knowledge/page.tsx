// app/advisor/knowledge/page.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { CorporateLayout } from "@/components/templates/CorporateLayout";
import { motion } from "framer-motion";
import { KnowledgeGraph } from "@/components/organisms/KnowledgeGraph";

// Default categories fallback
const defaultCategories = [
  {
    id: "investments",
    name: "Investment & Retirement",
    count: 0,
    description: "Unit trusts, retirement plans, education savings, and investment strategies",
  },
  {
    id: "insurance",
    name: "Insurance Products",
    count: 0,
    description: "Life insurance, funeral cover, disability, and health insurance solutions",
  },
  {
    id: "business",
    name: "Business Solutions",
    count: 0,
    description: "Business insurance, employee benefits, and corporate financial planning",
  },
  {
    id: "wealth",
    name: "Wealth Management",
    count: 0,
    description: "Financial planning, wealth advisory, and life stage planning",
  },
  {
    id: "claims",
    name: "Claims & Processes",
    count: 0,
    description: "Claims procedures, forms, and processing guidelines",
  },
  {
    id: "health",
    name: "Health & Short-term",
    count: 0,
    description: "Medical aid, short-term insurance, and health-related products",
  },
];

export default function AdvisorKnowledgePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showGraph, setShowGraph] = useState(false);
  const [knowledgeCategories, setKnowledgeCategories] = useState(defaultCategories);
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [categoryDocuments, setCategoryDocuments] = useState<any[]>([]);
  const [allDocuments, setAllDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  // Fetch knowledge base data
  useEffect(() => {
    const fetchKnowledgeData = async () => {
      setLoading(true);
      try {
        // Fetch documents to calculate categories
        const docsResponse = await fetch("/api/documents");
        if (docsResponse.ok) {
          const documents = await docsResponse.json();
          
          // Group documents by category and calculate counts
          const categoryMap = new Map<string, number>();
          documents.forEach((doc: any) => {
            if (doc.category) {
              const count = categoryMap.get(doc.category) || 0;
              categoryMap.set(doc.category, count + 1);
            }
          });

          // Update categories with real counts
          const updatedCategories = defaultCategories.map((cat) => {
            // Try to match category name
            const matchingCategory = Array.from(categoryMap.entries()).find(([key]) => 
              key.toLowerCase().includes(cat.id) || cat.name.toLowerCase().includes(key.toLowerCase())
            );
            return {
              ...cat,
              count: matchingCategory ? matchingCategory[1] : 0,
            };
          });
          setKnowledgeCategories(updatedCategories);

          // Generate popular searches from document titles
          const searchTerms = new Set<string>();
          documents.slice(0, 20).forEach((doc: any) => {
            if (doc.title) {
              // Extract key terms from titles
              const words = doc.title.toLowerCase().split(/\s+/);
              words.forEach((word: string) => {
                if (word.length > 4 && !['guide', 'complete', 'reference'].includes(word)) {
                  searchTerms.add(word);
                }
              });
            }
            if (doc.tags && Array.isArray(doc.tags)) {
              doc.tags.forEach((tag: string) => {
                if (tag.length > 3) {
                  searchTerms.add(tag.toLowerCase());
                }
              });
            }
          });
          setPopularSearches(Array.from(searchTerms).slice(0, 8));

          // Store all documents for filtering
          setAllDocuments(documents);

          // Create recent articles from documents
          const articles = documents
            .filter((doc: any) => doc.isActive !== false)
            .slice(0, 5)
            .map((doc: any, idx: number) => ({
              id: doc.documentNumber || `ART-${String(idx + 1).padStart(3, "0")}`,
              title: doc.title,
              category: doc.category || "General",
              date: doc.createdAt ? new Date(doc.createdAt).toISOString().split('T')[0] : "2025-11-04",
              views: doc.viewCount || Math.floor(Math.random() * 200) + 50,
              summary: doc.description || doc.title,
              documentNumber: doc.documentNumber, // Add document number for opening
              documentType: doc.documentType,
            }));
          setRecentArticles(articles);
        } else {
          console.error("Failed to fetch documents");
          toast.error("Failed to load knowledge base");
        }

        // Fetch knowledge base categories
        const knowledgeResponse = await fetch("/api/knowledge");
        if (knowledgeResponse.ok) {
          const knowledgeData = await knowledgeResponse.json();
          // Can use this for additional data if needed
        }
      } catch (error) {
        console.error("Error fetching knowledge data:", error);
        toast.error("Failed to load knowledge base");
      } finally {
        setLoading(false);
      }
    };

    fetchKnowledgeData();
  }, []);

  // Fetch documents when category is selected
  useEffect(() => {
    if (!selectedCategory) {
      setCategoryDocuments([]);
      return;
    }

    const fetchCategoryDocuments = async () => {
      setLoadingDocuments(true);
      try {
        // Map category ID to database category
        const categoryMap: Record<string, string> = {
          "investments": "Investment",
          "insurance": "Insurance",
          "business": "Business",
          "wealth": "Wealth",
          "claims": "Claims",
          "health": "Health",
        };

        const dbCategory = categoryMap[selectedCategory] || selectedCategory;
        
        // Fetch documents for this category
        const response = await fetch(`/api/documents?category=${encodeURIComponent(dbCategory)}`);
        if (response.ok) {
          const docs = await response.json();
          setCategoryDocuments(docs.filter((doc: any) => doc.isActive !== false));
        } else {
          toast.error("Failed to load documents for this category");
        }
      } catch (error) {
        console.error("Error fetching category documents:", error);
        toast.error("Failed to load documents");
      } finally {
        setLoadingDocuments(false);
      }
    };

    fetchCategoryDocuments();
  }, [selectedCategory]);

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
            <button 
              className="btn btn-om-primary btn-lg"
              onClick={async () => {
                if (!searchQuery.trim()) {
                  toast.error("Please enter a search query");
                  return;
                }
                try {
                  const response = await fetch(`/api/knowledge?query=${encodeURIComponent(searchQuery)}`);
                  if (response.ok) {
                    const results = await response.json();
                    toast.success(`Found ${results.total_results || 0} results`);
                    // In production, display results in a modal or results section
                  } else {
                    toast.error("Search failed");
                  }
                } catch (error) {
                  console.error("Search error:", error);
                  toast.error("Search failed");
                }
              }}
            >
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
          {popularSearches.length > 0 && (
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
          )}
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

      {/* Category Documents - Show when category is selected */}
      {selectedCategory && (
        <section className="container mx-auto px-4 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-om-navy">
              {knowledgeCategories.find(c => c.id === selectedCategory)?.name || "Documents"}
            </h2>
            <button
              onClick={() => setSelectedCategory(null)}
              className="btn btn-sm btn-outline"
            >
              Clear Filter
            </button>
          </div>
          {loadingDocuments ? (
            <div className="text-center py-8">
              <div className="loading loading-spinner loading-lg text-om-green"></div>
            </div>
          ) : categoryDocuments.length === 0 ? (
            <div className="card-om p-6 text-center">
              <p className="text-om-grey">No documents found in this category</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryDocuments.map((doc: any) => (
                <motion.div
                  key={doc.documentNumber}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card-om"
                >
                  <div className="card-body">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-om-navy text-lg flex-1">
                        {doc.title}
                      </h3>
                      <div className="badge badge-sm">{doc.documentType}</div>
                    </div>
                    {doc.description && (
                      <p className="text-sm text-om-grey mb-3">{doc.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-om-grey mb-3">
                      <span>{doc.viewCount || 0} views</span>
                      <span>•</span>
                      <span>{doc.downloadCount || 0} downloads</span>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={`/api/documents/${doc.documentNumber}/view`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-om-primary flex-1"
                      >
                        View
                      </a>
                      <a
                        href={`/api/documents/${doc.documentNumber}/download`}
                        download
                        className="btn btn-sm btn-outline"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Recent Articles */}
      <section className="container mx-auto px-4 pb-6">
        <h2 className="text-xl font-bold text-om-navy mb-4">Recent Updates</h2>
        {loading ? (
          <div className="text-center py-8">
            <div className="loading loading-spinner loading-lg text-om-green"></div>
          </div>
        ) : recentArticles.length === 0 ? (
          <div className="card-om p-6 text-center">
            <p className="text-om-grey">No articles found</p>
          </div>
        ) : (
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

                  <div className="flex gap-2">
                    {article.documentNumber && (
                      <>
                        <a
                          href={`/api/documents/${article.documentNumber}/view`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-om-primary"
                        >
                          View PDF
                        </a>
                        <a
                          href={`/api/documents/${article.documentNumber}/download`}
                          download
                          className="btn btn-sm btn-outline"
                        >
                          Download
                        </a>
                      </>
                    )}
                    {!article.documentNumber && (
                      <button 
                        className="btn btn-sm btn-om-primary"
                        onClick={() => {
                          toast.error("Document not available");
                        }}
                      >
                        Read Article
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            ))}
          </div>
        )}
      </section>

      {/* Quick Links */}
      <section className="container mx-auto px-4 pb-20">
        <h2 className="text-xl font-bold text-om-navy mb-4">Quick Links</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <Link href="/products" className="card-om hover:shadow-xl transition-shadow cursor-pointer">
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
          </Link>

          <Link href="/api/documents" className="card-om hover:shadow-xl transition-shadow cursor-pointer">
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
          </Link>

          <a 
            href="https://www.oldmutual.com/namibia/support/training" 
            target="_blank" 
            rel="noopener noreferrer"
            className="card-om hover:shadow-xl transition-shadow cursor-pointer"
          >
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
          </a>

          <Link href="/chat" className="card-om hover:shadow-xl transition-shadow cursor-pointer">
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
          </Link>
        </div>
      </section>
    </CorporateLayout>
  );
}
