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
  "Retirement Solutions": null, // May need to search for retirement docs
  "Education Savings Plans": null, // May need to search for education docs
  "Business Insurance": null, // May need to search for business docs
  "Health Insurance": null, // May need to search for health docs
  "Short-term Insurance": null, // May need to search for short-term docs
};

export default function ProductsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Record<string, any>>({});

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
        // Fetch Insurance Product Guides
        const insuranceResponse = await fetch("/api/documents?category=Insurance&type=Product Guide");
        // Fetch Investment Forms (for Unit Trusts)
        const investmentResponse = await fetch("/api/documents?category=Investment&type=Form");
        
        const docsMap: Record<string, any> = {};
        
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
            } else if (title.includes("disability") && title.includes("income")) {
              docsMap["OMP Disability Income Cover"] = doc;
            }
          });
        } else {
          console.error("Failed to fetch insurance documents:", insuranceResponse.status);
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
          console.error("Failed to fetch investment documents:", investmentResponse.status);
        }
        
        setDocuments(docsMap);
        console.log("Documents loaded:", Object.keys(docsMap).length, "documents");
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };

    fetchDocuments();
  }, [router]);

  const handleLearnMore = (productName: string) => {
    // Try to find document by product name or document number
    const docNumber = productDocumentMap[productName];
    const doc = docNumber ? documents[docNumber] : documents[productName];
    
    if (doc) {
      // Open PDF viewer in new tab
      window.open(`/api/documents/${doc.documentNumber}/view`, "_blank");
    } else {
      // Fallback: search for product in chat or show message
      alert(`Product guide for "${productName}" is being prepared. Please contact an advisor for more information.`);
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
          if (advisorId && !advisorId.includes('-')) {
            // Convert ADV001 to ADV-001 format
            advisorId = advisorId.replace(/ADV(\d{3})/, 'ADV-$1');
          }
          router.push(`/advisors/${advisorId}/book?product=${encodeURIComponent(productName)}`);
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
          features: ["Extended family coverage", "Cashback benefits", "Premium holidays", "Flexible premiums"],
          Icon: HeartIcon,
        },
        {
          name: "OMP Disability Income Cover",
          description: "Monthly income replacement for disability with comprehensive support services.",
          features: ["75% income replacement", "Rehabilitation support", "Tax-efficient benefits", "Flexible terms"],
          Icon: BuildingOfficeIcon,
        },
      ],
    },
    {
      category: "Investment Solutions",
      items: [
        {
          name: "Unit Trusts",
          description: "Professional investment portfolios with diversification across asset classes and markets.",
          features: ["Professional management", "Multi-asset options", "Daily liquidity", "Tax-efficient structures"],
          Icon: ChartBarIcon,
        },
        {
          name: "Retirement Solutions",
          description: "Comprehensive retirement planning with pension funds, annuities, and preservation options.",
          features: ["Tax-deductible contributions", "Professional management", "Flexible withdrawal options", "Guaranteed income streams"],
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
          description: "Comprehensive business protection including key person, liability, and property coverage.",
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
          description: "Medical aid and health insurance solutions with comprehensive coverage options.",
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
          description: "Vehicle, property, and liability insurance with comprehensive protection.",
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
                        const doc = docNumber ? documents[docNumber] : documents[product.name];
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
