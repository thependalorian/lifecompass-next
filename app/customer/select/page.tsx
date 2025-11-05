/**
 * Customer Persona Selection Page
 * Location: /app/customer/select/page.tsx
 * Purpose: Allow users to select a customer persona before accessing the customer experience
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { CorporateLayout } from "@/components/templates/CorporateLayout";
import { OMButton } from "@/components/atoms/brand";
import { motion } from "framer-motion";
import {
  UserIcon,
  BriefcaseIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

export default function CustomerPersonaSelection() {
  const router = useRouter();
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const [customerPersonas, setCustomerPersonas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterSegment, setFilterSegment] = useState<string>("all");
  const [filterRegion, setFilterRegion] = useState<string>("all");
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "carousel">("carousel");

  useEffect(() => {
    // Fetch customers from API
    const fetchCustomers = async () => {
      try {
        const response = await fetch("/api/customers");
        if (!response.ok) {
          throw new Error("Failed to fetch customers");
        }
        const data = await response.json();
        // Transform data to match expected format
        const transformed = data.map((customer: any) => ({
          ...customer,
          role: customer.occupation || customer.segment,
          location: customer.city ? `${customer.city}, ${customer.region}` : customer.region,
          monthlyIncome: customer.monthlyIncome 
            ? `N$${customer.monthlyIncome.toLocaleString()}` 
            : "Not specified",
          family: customer.maritalStatus 
            ? `${customer.maritalStatus}${customer.dependentsCount > 0 ? `, ${customer.dependentsCount} ${customer.dependentsCount === 1 ? 'child' : 'children'}` : ''}`
            : "Not specified",
        }));
        setCustomerPersonas(transformed);
      } catch (err) {
        console.error("Error fetching customers:", err);
        setError("Failed to load customers. Please try again.");
        // Fallback to empty array
        setCustomerPersonas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Extract unique segments and regions for filters
  const uniqueSegments = useMemo(() => {
    const segments = new Set<string>();
    customerPersonas.forEach((persona) => {
      if (persona.segment) segments.add(persona.segment);
    });
    return Array.from(segments).sort();
  }, [customerPersonas]);

  const uniqueRegions = useMemo(() => {
    const regions = new Set<string>();
    customerPersonas.forEach((persona) => {
      if (persona.region) regions.add(persona.region);
    });
    return Array.from(regions).sort();
  }, [customerPersonas]);

  // Filter personas based on selected filters
  const filteredPersonas = useMemo(() => {
    return customerPersonas.filter((persona) => {
      const segmentMatch = filterSegment === "all" || persona.segment === filterSegment;
      const regionMatch = filterRegion === "all" || persona.region === filterRegion;
      return segmentMatch && regionMatch;
    });
  }, [customerPersonas, filterSegment, filterRegion]);

  // Carousel navigation
  const cardsPerPage = 3; // Show 3 cards at a time
  const maxIndex = Math.max(0, Math.ceil(filteredPersonas.length / cardsPerPage) - 1);
  
  const nextCarousel = () => {
    setCarouselIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prevCarousel = () => {
    setCarouselIndex((prev) => Math.max(prev - 1, 0));
  };

  const visiblePersonas = useMemo(() => {
    if (viewMode === "carousel") {
      const start = carouselIndex * cardsPerPage;
      return filteredPersonas.slice(start, start + cardsPerPage);
    }
    return filteredPersonas;
  }, [filteredPersonas, carouselIndex, viewMode]);

  const handleContinue = () => {
    if (selectedPersona) {
      // Store selected persona in sessionStorage
      const persona = filteredPersonas.find((p) => p.id === selectedPersona);
      if (persona) {
        sessionStorage.setItem("selectedCustomerPersona", selectedPersona);
        sessionStorage.setItem("customerPersonaData", JSON.stringify(persona));
      }
      // Navigate to customer profile page
      router.push(`/customer/profile/${selectedPersona}`);
    }
  };

  // Reset carousel index when filters change
  useEffect(() => {
    setCarouselIndex(0);
  }, [filterSegment, filterRegion]);

  if (loading) {
    return (
      <CorporateLayout
        heroTitle="Loading Customers..."
        heroSubtitle="Please wait while we load customer information"
        pageType="customer"
      >
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto text-center">
            <div className="loading loading-spinner loading-lg text-om-heritage-green"></div>
            <p className="mt-4 text-om-grey">Loading customers...</p>
          </div>
        </section>
      </CorporateLayout>
    );
  }

  if (error) {
    return (
      <CorporateLayout
        heroTitle="Error Loading Customers"
        heroSubtitle={error}
        pageType="customer"
      >
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto text-center">
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          </div>
        </section>
      </CorporateLayout>
    );
  }

  return (
    <CorporateLayout
      heroTitle="Select Your Customer Persona"
      heroSubtitle="Choose a persona to explore the LifeCompass customer experience"
      pageType="customer"
    >
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <p className="text-lg text-om-grey text-center max-w-2xl mx-auto mb-6">
              Select a customer persona to experience LifeCompass from their perspective. 
              Each persona represents a real Namibian customer with unique financial needs and circumstances.
            </p>

            {/* Filter Dropdowns */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <div className="form-control w-full sm:w-auto max-w-xs">
                <label className="label">
                  <span className="label-text text-om-grey">Filter by Segment</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={filterSegment}
                  onChange={(e) => setFilterSegment(e.target.value)}
                >
                  <option value="all">All Segments</option>
                  {uniqueSegments.map((segment) => (
                    <option key={segment} value={segment}>
                      {segment}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control w-full sm:w-auto max-w-xs">
                <label className="label">
                  <span className="label-text text-om-grey">Filter by Region</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={filterRegion}
                  onChange={(e) => setFilterRegion(e.target.value)}
                >
                  <option value="all">All Regions</option>
                  {uniqueRegions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="form-control w-full sm:w-auto max-w-xs">
                <label className="label">
                  <span className="label-text text-om-grey">View Mode</span>
                </label>
                <div className="btn-group">
                  <button
                    className={`btn ${viewMode === "carousel" ? "btn-active" : ""}`}
                    onClick={() => setViewMode("carousel")}
                  >
                    Carousel
                  </button>
                  <button
                    className={`btn ${viewMode === "grid" ? "btn-active" : ""}`}
                    onClick={() => setViewMode("grid")}
                  >
                    Grid
                  </button>
                </div>
              </div>
            </div>

            <div className="text-center mb-4">
              <p className="text-sm text-om-grey">
                Showing {filteredPersonas.length} of {customerPersonas.length} personas
              </p>
            </div>
          </motion.div>

          {/* Carousel View */}
          {viewMode === "carousel" && (
            <div className="mb-8">
              <div className="relative">
                {/* Carousel Container */}
                <div className="flex items-center gap-4 overflow-hidden">
                  {/* Previous Button */}
                  <button
                    onClick={prevCarousel}
                    disabled={carouselIndex === 0}
                    className={`btn btn-circle btn-ghost ${carouselIndex === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <ChevronLeftIcon className="w-6 h-6" />
                  </button>

                  {/* Persona Cards */}
                  <div className="flex-1 grid md:grid-cols-3 gap-6">
                    {visiblePersonas.map((persona, idx) => (
                      <PersonaCard
                        key={persona.id}
                        persona={persona}
                        selectedPersona={selectedPersona}
                        setSelectedPersona={setSelectedPersona}
                        idx={idx}
                      />
                    ))}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={nextCarousel}
                    disabled={carouselIndex >= maxIndex}
                    className={`btn btn-circle btn-ghost ${carouselIndex >= maxIndex ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <ChevronRightIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Carousel Indicators */}
                {maxIndex > 0 && (
                  <div className="flex justify-center gap-2 mt-6">
                    {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCarouselIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          idx === carouselIndex
                            ? "bg-om-heritage-green w-8"
                            : "bg-om-grey-30"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Grid View */}
          {viewMode === "grid" && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredPersonas.map((persona, idx) => (
                <PersonaCard
                  key={persona.id}
                  persona={persona}
                  selectedPersona={selectedPersona}
                  setSelectedPersona={setSelectedPersona}
                  idx={idx}
                />
              ))}
            </div>
          )}

          {/* Continue Button */}
          <div className="text-center mt-8">
            <OMButton
              variant="primary"
              size="lg"
              onClick={handleContinue}
              disabled={!selectedPersona}
              className={!selectedPersona ? "opacity-50 cursor-not-allowed" : ""}
            >
              Continue to Profile
            </OMButton>
          </div>
        </div>
      </section>
    </CorporateLayout>
  );
}

// Persona Card Component
function PersonaCard({
  persona,
  selectedPersona,
  setSelectedPersona,
  idx,
}: {
  persona: any;
  selectedPersona: string | null;
  setSelectedPersona: (id: string) => void;
  idx: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1 }}
      onClick={() => setSelectedPersona(persona.id)}
      className={`card-om cursor-pointer transition-all duration-200 ${
        selectedPersona === persona.id
          ? "ring-2 ring-om-heritage-green shadow-lg"
          : "hover:shadow-md"
      }`}
    >
      <div className="card-body">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-om-navy mb-1">
              {persona.name}
            </h3>
            <p className="text-sm text-om-grey">{persona.role}</p>
          </div>
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              selectedPersona === persona.id
                ? "bg-om-heritage-green border-om-heritage-green"
                : "border-om-grey"
            }`}
          >
            {selectedPersona === persona.id && (
              <div className="w-3 h-3 rounded-full bg-white" />
            )}
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-om-grey">
            <MapPinIcon className="w-4 h-4 flex-shrink-0" />
            <span>{persona.location}</span>
          </div>
          <div className="flex items-center gap-2 text-om-grey">
            <BriefcaseIcon className="w-4 h-4 flex-shrink-0" />
            <span>{persona.occupation}</span>
          </div>
          <div className="flex items-center gap-2 text-om-grey">
            <CurrencyDollarIcon className="w-4 h-4 flex-shrink-0" />
            <span>{persona.monthlyIncome}</span>
          </div>
          <div className="flex items-center gap-2 text-om-grey">
            <UserIcon className="w-4 h-4 flex-shrink-0" />
            <span>{persona.family}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

