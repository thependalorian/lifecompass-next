// app/products/page.tsx
// Product Information Hub - Customer Self-Service Flow
// PRD: Product Categories, Interactive Product Cards, AI-Powered Recommendations

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { CorporateLayout } from "@/components/templates/CorporateLayout";
import { PolicySummaryTile } from "@/components/molecules/PolicySummaryTile";
import { QuickActionButtons } from "@/components/molecules/QuickActionButtons";
import { motion } from "framer-motion";
import {
  ShieldCheckIcon,
  HeartIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  BeakerIcon,
  AcademicCapIcon,
  TruckIcon,
  HomeIcon,
  BuildingOffice2Icon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
} from "@/components/atoms/icons";
import { OMButton } from "@/components/atoms/brand";

// Product to Document Number mapping
const productDocumentMap: Record<string, string | null> = {
  "OMP Severe Illness Cover": "DOC-004",
  "OMP Funeral Insurance": "DOC-001", // Extended Family Funeral Cover
  "OMP Disability Income Cover": "DOC-005",
  "Unit Trusts": "DOC-024", // Unit Trust Individual Buying Form
  "Retirement Solutions": null, // Search: Investment brochures (Growth Fund, Money Fund)
  "Education Savings Plans": null, // Search: Investment products
  "Business Insurance": "DOC-013", // OMP Business Expense Cover
  "Health Insurance": null, // Search: Injury/Illness forms, general insurance guides
  "Short-term Insurance": "DOC-041", // Travelsure Brochure (travel insurance)
};

// Product to search keywords mapping (for products without direct document mappings)
const productSearchKeywords: Record<string, string[]> = {
  "Retirement Solutions": [
    "retirement",
    "pension",
    "annuity",
    "growth fund",
    "money fund",
    "investment",
  ],
  "Education Savings Plans": [
    "education",
    "savings",
    "investment",
    "unit trust",
    "growth fund",
  ],
  "Health Insurance": [
    "health",
    "medical",
    "illness",
    "injury",
    "disability",
    "income cover",
  ],
  "Short-term Insurance": [
    "short-term",
    "travel",
    "motor",
    "property",
    "vehicle",
    "accident",
    "theft",
  ],
};

export default function ProductsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Record<string, any>>({});
  const [allDocuments, setAllDocuments] = useState<any[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  useEffect(() => {
    // Check if persona is selected
    const selectedPersona = sessionStorage.getItem("selectedCustomerPersona");
    if (!selectedPersona) {
      // Redirect to persona selection if not selected
      router.push("/customer/select");
      return;
    }

    // Fetch product guides and forms for products that have document mappings
    const fetchDocuments = async () => {
      try {
        // Fetch all relevant document categories
        const [insuranceResponse, investmentResponse, allDocsResponse] =
          await Promise.all([
            fetch("/api/documents?category=Insurance&type=Product Guide"),
            fetch("/api/documents?category=Investment&type=Form"),
            fetch("/api/documents"), // Fetch all for keyword searching
          ]);

        const docsMap: Record<string, any> = {};
        let allDocs: any[] = [];

        // Get all documents for keyword searching
        if (allDocsResponse.ok) {
          allDocs = await allDocsResponse.json();
        }

        // Process Insurance Product Guides
        if (insuranceResponse.ok) {
          const insuranceDocs = await insuranceResponse.json();
          insuranceDocs.forEach((doc: any) => {
            // Map by document number
            docsMap[doc.documentNumber] = doc;
            // Also map by title keywords for better matching
            const title = doc.title.toLowerCase();
            if (title.includes("severe illness")) {
              docsMap["OMP Severe Illness Cover"] = doc;
            } else if (title.includes("funeral")) {
              // Match both Extended and Family Funeral Cover
              if (title.includes("extended") || title.includes("family")) {
                docsMap["OMP Funeral Insurance"] = doc;
              }
            } else if (
              title.includes("disability") &&
              title.includes("income")
            ) {
              docsMap["OMP Disability Income Cover"] = doc;
            } else if (title.includes("business expense")) {
              docsMap["Business Insurance"] = doc;
            } else if (
              title.includes("travel") ||
              title.includes("travelsure")
            ) {
              docsMap["Short-term Insurance"] = doc;
            }
          });
        } else {
          console.error(
            "Failed to fetch insurance documents:",
            insuranceResponse.status,
          );
          toast.error("Failed to load product guides");
        }

        // Process Investment Forms (for Unit Trusts)
        if (investmentResponse.ok) {
          const investmentDocs = await investmentResponse.json();
          investmentDocs.forEach((doc: any) => {
            // Map by document number
            docsMap[doc.documentNumber] = doc;
            // Map Unit Trust forms to "Unit Trusts" product
            const title = doc.title.toLowerCase();
            if (title.includes("unit trust") && title.includes("buying")) {
              // Use first buying form found, but don't overwrite if already set
              if (!docsMap["Unit Trusts"]) {
                docsMap["Unit Trusts"] = doc;
              }
            }
          });
        } else {
          console.error(
            "Failed to fetch investment documents:",
            investmentResponse.status,
          );
        }

        // Search for products without direct mappings using keywords
        Object.entries(productSearchKeywords).forEach(
          ([productName, keywords]) => {
            if (!docsMap[productName]) {
              // Find document that matches any keyword
              const matchingDoc = allDocs.find((doc: any) => {
                if (!doc.isActive) return false;
                const title = doc.title.toLowerCase();
                const description = (doc.description || "").toLowerCase();
                const category = (doc.category || "").toLowerCase();

                return keywords.some(
                  (keyword) =>
                    title.includes(keyword.toLowerCase()) ||
                    description.includes(keyword.toLowerCase()) ||
                    category.includes(keyword.toLowerCase()),
                );
              });

              if (matchingDoc) {
                docsMap[productName] = matchingDoc;
              }
            }
          },
        );

        setDocuments(docsMap);
        console.log(
          "Documents loaded:",
          Object.keys(docsMap).length,
          "documents",
        );
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };

    fetchDocuments();
  }, [router]);

  // Fetch all documents for policies and forms listing
  useEffect(() => {
    const fetchAllDocuments = async () => {
      setLoadingDocuments(true);
      try {
        // Fetch all documents grouped by category
        const [allDocsResponse, policiesResponse, formsResponse] =
          await Promise.all([
            fetch("/api/documents"),
            fetch("/api/documents?category=Insurance"),
            fetch("/api/documents?type=Form"),
          ]);

        if (allDocsResponse.ok) {
          const allDocs = await allDocsResponse.json();
          setAllDocuments(allDocs.filter((doc: any) => doc.isActive !== false));
        }
      } catch (error) {
        console.error("Error fetching all documents:", error);
      } finally {
        setLoadingDocuments(false);
      }
    };

    fetchAllDocuments();
  }, []);

  const handleLearnMore = async (productName: string) => {
    // Try to find document by product name or document number
    const docNumber = productDocumentMap[productName];
    let doc = docNumber ? documents[docNumber] : documents[productName];

    // If not found in documents map, search in allDocuments using keywords
    if (!doc && allDocuments.length > 0) {
      const keywords = productSearchKeywords[productName] || [];
      if (keywords.length > 0) {
        doc = allDocuments.find((d: any) => {
          if (!d.isActive) return false;
          const title = d.title.toLowerCase();
          const description = (d.description || "").toLowerCase();
          const category = (d.category || "").toLowerCase();

          return keywords.some(
            (keyword) =>
              title.includes(keyword.toLowerCase()) ||
              description.includes(keyword.toLowerCase()) ||
              category.includes(keyword.toLowerCase()),
          );
        });
      }
    }

    if (doc) {
      // Open PDF viewer in new tab
      window.open(`/api/documents/${doc.documentNumber}/view`, "_blank");
    } else {
      // Fallback: redirect to chat with product context or show message
      const chatUrl = `/chat?query=${encodeURIComponent(`Tell me about ${productName}`)}`;
      if (
        confirm(
          `Product guide for "${productName}" is being prepared. Would you like to chat with our AI assistant about this product?`,
        )
      ) {
        router.push(chatUrl);
      }
    }
  };

  const handleGetQuote = (productName: string) => {
    // Get selected persona to get advisor
    const selectedPersona = sessionStorage.getItem("selectedCustomerPersona");
    if (selectedPersona) {
      try {
        const persona = JSON.parse(selectedPersona);
        // Redirect to advisor booking with product context
        if (persona.primaryAdvisorId) {
          // Normalize advisor ID format (handle both ADV-001 and ADV001)
          let advisorId = persona.primaryAdvisorId;
          if (advisorId && !advisorId.includes("-")) {
            // Convert ADV001 to ADV-001 format
            advisorId = advisorId.replace(/ADV(\d{3})/, "ADV-$1");
          }
          router.push(
            `/advisors/${advisorId}/book?product=${encodeURIComponent(productName)}`,
          );
        } else {
          // Go to advisor selection with product context
          router.push(`/advisors?product=${encodeURIComponent(productName)}`);
        }
      } catch (error) {
        // Fallback to advisor selection
        router.push(`/advisors?product=${encodeURIComponent(productName)}`);
      }
    } else {
      router.push(`/advisors?product=${encodeURIComponent(productName)}`);
    }
  };
  const products = [
    {
      category: "Life & Funeral Insurance",
      items: [
        {
          name: "OMP Severe Illness Cover",
          description:
            "Comprehensive coverage for 68 severe illnesses with lump sum benefits and family protection.",
          features: [
            "68 severe illnesses covered",
            "Lump sum payments",
            "Family protection benefits",
            "Cashback options",
          ],
          Icon: ShieldCheckIcon,
        },
        {
          name: "OMP Funeral Insurance",
          description:
            "Complete funeral coverage with extended family protection and cashback benefits.",
          features: [
            "Extended family coverage",
            "Cashback benefits",
            "Premium holidays",
            "Flexible premiums",
          ],
          Icon: HeartIcon,
        },
        {
          name: "OMP Disability Income Cover",
          description:
            "Monthly income replacement for disability with comprehensive support services.",
          features: [
            "75% income replacement",
            "Rehabilitation support",
            "Tax-efficient benefits",
            "Flexible terms",
          ],
          Icon: BuildingOfficeIcon,
        },
      ],
    },
    {
      category: "Investment Solutions",
      items: [
        {
          name: "Unit Trusts",
          description:
            "Professional investment portfolios with diversification across asset classes and markets.",
          features: [
            "Professional management",
            "Multi-asset options",
            "Daily liquidity",
            "Tax-efficient structures",
          ],
          Icon: ChartBarIcon,
        },
        {
          name: "Retirement Solutions",
          description:
            "Comprehensive retirement planning with pension funds, annuities, and preservation options.",
          features: [
            "Tax-deductible contributions",
            "Professional management",
            "Flexible withdrawal options",
            "Guaranteed income streams",
          ],
          Icon: BeakerIcon,
        },
        {
          name: "Education Savings Plans",
          description:
            "Structured savings for children's education with tax advantages and flexible access.",
          features: [
            "Tax incentives available",
            "Education-focused withdrawals",
            "Flexible contribution options",
            "Inflation protection",
          ],
          Icon: AcademicCapIcon,
        },
      ],
    },
    {
      category: "Business & Health Solutions",
      items: [
        {
          name: "Business Insurance",
          description:
            "Comprehensive business protection including key person, liability, and property coverage.",
          features: [
            "Key person protection",
            "Business interruption coverage",
            "Liability protection",
            "Employee benefits",
          ],
          Icon: TruckIcon,
        },
        {
          name: "Health Insurance",
          description:
            "Medical aid and health insurance solutions with comprehensive coverage options.",
          features: [
            "Hospitalization coverage",
            "Outpatient benefits",
            "Chronic disease management",
            "Preventive care",
          ],
          Icon: HomeIcon,
        },
        {
          name: "Short-term Insurance",
          description:
            "Vehicle, property, and liability insurance with comprehensive protection.",
          features: [
            "Comprehensive coverage",
            "24/7 assistance",
            "Flexible payment options",
            "Claims management",
          ],
          Icon: BuildingOffice2Icon,
        },
      ],
    },
  ];

  const quickActions = [
    {
      label: "Chat with LifeCompass",
      href: "/chat",
      icon: <ChatBubbleLeftRightIcon className="w-4 h-4" />,
      variant: "primary" as const,
    },
    {
      label: "Find an Advisor",
      href: "/advisors",
      icon: <UserGroupIcon className="w-4 h-4" />,
      variant: "outline" as const,
    },
  ];

  return (
    <CorporateLayout
      heroTitle="Our Products"
      heroSubtitle="Explore comprehensive financial solutions designed for your needs"
      heroBackground="/id3Zh06DHT_1762296722528.jpeg"
      pageType="customer"
      showBreadcrumbs={true}
      breadcrumbItems={[
        { label: "Customer", href: "/customer/select" },
        { label: "Products", href: "/products" },
      ]}
    >
      {/* Products Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          {products.map((category, categoryIdx) => (
            <div key={category.category} className="mb-16">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="text-3xl font-bold text-om-navy mb-8"
              >
                {category.category}
              </motion.h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {category.items.map((product, productIdx) => (
                  <motion.div
                    key={product.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: productIdx * 0.1 }}
                    viewport={{ once: true }}
                    className="card-om p-6"
                  >
                    <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-lg bg-om-heritage-green/10">
                      {product.Icon && (
                        <product.Icon className="w-8 h-8 text-om-heritage-green" />
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-om-navy mb-3">
                      {product.name}
                    </h3>
                    <p className="text-om-grey mb-4">{product.description}</p>
                    <ul className="space-y-2 mb-6">
                      {product.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-center text-sm text-om-grey"
                        >
                          <CheckCircleIcon className="w-4 h-4 text-om-heritage-green mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="flex gap-2">
                      {(() => {
                        const docNumber = productDocumentMap[product.name];
                        const doc = docNumber
                          ? documents[docNumber]
                          : documents[product.name];
                        return (
                          <>
                            {doc && (
                              <a
                                href={`/api/documents/${doc.documentNumber}/view`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <OMButton
                                  variant="outline"
                                  size="sm"
                                  className="rounded-full text-center"
                                >
                                  View Guide
                                </OMButton>
                              </a>
                            )}
                            <OMButton
                              variant="primary"
                              size="sm"
                              className="flex-1 rounded-full text-center"
                              onClick={() => handleLearnMore(product.name)}
                            >
                              Learn More
                            </OMButton>
                            <OMButton
                              variant="outline"
                              size="sm"
                              className="rounded-full text-center"
                              onClick={() => handleGetQuote(product.name)}
                            >
                              Get Quote
                            </OMButton>
                          </>
                        );
                      })()}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Policies & Forms Library */}
      <section className="py-20 bg-om-light-grey">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-om-navy mb-4">
              Policies & Forms Library
            </h2>
            <p className="text-xl text-om-grey max-w-2xl mx-auto">
              Browse and download all available policy documents, product
              guides, and application forms
            </p>
          </motion.div>

          {loadingDocuments ? (
            <div className="text-center py-12">
              <div className="loading loading-spinner loading-lg text-om-green"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allDocuments
                .filter(
                  (doc: any) =>
                    doc.documentType === "Product Guide" ||
                    doc.documentType === "Form" ||
                    doc.documentType === "Policy Document",
                )
                .slice(0, 12)
                .map((doc: any, idx: number) => (
                  <motion.div
                    key={doc.documentNumber}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                    className="card-om p-6"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-om-navy text-lg mb-1">
                          {doc.title}
                        </h3>
                        <div className="flex gap-2 mb-2">
                          <span className="badge badge-sm badge-outline">
                            {doc.category}
                          </span>
                          <span className="badge badge-sm badge-outline">
                            {doc.documentType}
                          </span>
                        </div>
                      </div>
                    </div>
                    {doc.description && (
                      <p className="text-sm text-om-grey mb-4 line-clamp-2">
                        {doc.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-om-grey mb-4">
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
                  </motion.div>
                ))}
            </div>
          )}

          {allDocuments.length > 12 && (
            <div className="text-center mt-8">
              <Link href="/advisor/knowledge">
                <OMButton variant="outline" size="lg">
                  View All Documents
                </OMButton>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-om-light-grey py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-om-navy mb-6">
              Ready to Secure Your Financial Future?
            </h2>
            <p className="text-xl text-om-grey mb-8">
              Speak with one of our expert advisors to find the perfect products
              for your needs.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/advisors">
                <OMButton variant="primary" size="lg">
                  Find an Advisor
                </OMButton>
              </Link>
              <Link href="/claims">
                <OMButton variant="outline" size="lg">
                  File a Claim
                </OMButton>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </CorporateLayout>
  );
}
