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
} from "@heroicons/react/24/outline";
import { dispatchPersonaChanged } from "@/lib/hooks/usePersonaState";

export default function CustomerPersonaSelection() {
  const router = useRouter();
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const [customerPersonas, setCustomerPersonas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterSegment, setFilterSegment] = useState<string>("all");
  const [filterRegion, setFilterRegion] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

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
        const transformed = data.map((customer: any) => {
          // Handle monthlyIncome - check if already formatted (string) or needs formatting (number)
          let monthlyIncomeDisplay: string;
          if (!customer.monthlyIncome) {
            monthlyIncomeDisplay = "Not specified";
          } else if (typeof customer.monthlyIncome === "string") {
            // Already formatted by PII mask (e.g., "N$10,000")
            monthlyIncomeDisplay = customer.monthlyIncome;
          } else {
            // Number - format it
            monthlyIncomeDisplay = `N$${Number(customer.monthlyIncome).toLocaleString()}`;
          }

          return {
            ...customer,
            role: customer.occupation || customer.segment,
            location: customer.city
              ? `${customer.city}, ${customer.region}`
              : customer.region,
            monthlyIncome: monthlyIncomeDisplay,
            family: customer.maritalStatus
              ? `${customer.maritalStatus}${customer.dependentsCount > 0 ? `, ${customer.dependentsCount} ${customer.dependentsCount === 1 ? "child" : "children"}` : ""}`
              : "Not specified",
          };
        });
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

  // Filter personas based on selected filters and search
  const filteredPersonas = useMemo(() => {
    return customerPersonas.filter((persona) => {
      const matchesSearch =
        searchTerm === "" ||
        persona.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        persona.occupation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        persona.region?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        persona.segment?.toLowerCase().includes(searchTerm.toLowerCase());
      const segmentMatch =
        filterSegment === "all" || persona.segment === filterSegment;
      const regionMatch =
        filterRegion === "all" || persona.region === filterRegion;
      return matchesSearch && segmentMatch && regionMatch;
    });
  }, [customerPersonas, filterSegment, filterRegion, searchTerm]);

  const handleContinue = () => {
    if (selectedPersona) {
      // Store selected persona in sessionStorage
      const persona = filteredPersonas.find((p) => p.id === selectedPersona);
      if (persona) {
        // Clear any existing advisor persona to prevent context conflicts
        sessionStorage.removeItem("selectedAdvisorPersona");
        sessionStorage.removeItem("advisorPersonaData");
        dispatchPersonaChanged(); // Notify listeners of persona change

        sessionStorage.setItem("selectedCustomerPersona", selectedPersona);
        sessionStorage.setItem("customerPersonaData", JSON.stringify(persona));
      }
      // Navigate to customer profile page
      router.push(`/customer/profile/${selectedPersona}`);
    }
  };

  // Note: Persona selection page is always accessible for switching personas
  // No auto-redirect needed as users may want to switch personas


  // Clear selection if selected persona is no longer in filtered list
  useEffect(() => {
    if (
      selectedPersona &&
      !filteredPersonas.find((p) => p.id === selectedPersona)
    ) {
      setSelectedPersona(null);
    }
  }, [filteredPersonas, selectedPersona]);

  if (loading) {
    return (
      <CorporateLayout
        heroTitle="Loading Customers..."
        heroSubtitle="Please wait while we load customer information"
        pageType="customer"
        showChat={false}
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
        showChat={false}
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
      showChat={false}
    >
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search customers by name, occupation, or region..."
                  className="input input-bordered w-full input-om"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="select select-bordered input-om"
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
              <select
                className="select select-bordered input-om"
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
          </motion.div>

          {/* Customers Grid */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-om-navy">
              {filteredPersonas.length} Customer{filteredPersonas.length !== 1 ? "s" : ""} Found
            </h2>
            <div className="text-sm text-om-grey">
              Showing {filteredPersonas.length} of {customerPersonas.length} customers
            </div>
          </div>

          {/* Empty State */}
          {filteredPersonas.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4 text-om-grey font-bold">
                NO CUSTOMERS FOUND
              </div>
              <h3 className="text-xl font-bold text-om-navy mb-2">
                No Customers Found
              </h3>
              <p className="text-om-grey mb-4">
                Try adjusting your search criteria or filters.
              </p>
              <button
                className="btn-om-primary"
                onClick={() => {
                  setSearchTerm("");
                  setFilterSegment("all");
                  setFilterRegion("all");
                }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8 mb-8">
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
              className={
                !selectedPersona ? "opacity-50 cursor-not-allowed" : ""
              }
            >
              Continue to Profile
            </OMButton>
          </div>
        </div>
      </section>
    </CorporateLayout>
  );
}

// Persona Card Component - Matches advisors page style
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
      key={persona.id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: idx * 0.1 }}
      viewport={{ once: true }}
      onClick={() => setSelectedPersona(persona.id)}
      className={`card-om p-6 cursor-pointer transition-all duration-200 ${
        selectedPersona === persona.id
          ? "ring-2 ring-om-heritage-green shadow-lg"
          : "hover:shadow-md"
      }`}
    >
      <div className="flex items-start gap-4">
        {persona.avatarUrl && (
          <div className="avatar placeholder">
            <div className="rounded-full w-16 h-16 overflow-hidden ring-2 ring-om-heritage-green/20 aspect-square">
              <img
                src={persona.avatarUrl}
                alt={persona.name}
                className="w-full h-full object-cover aspect-square"
              />
            </div>
          </div>
        )}

        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-xl font-bold text-om-navy">{persona.name}</h3>
              <p className="text-om-green font-semibold">{persona.segment}</p>
            </div>
            <div
              className={`w-6 h-6 min-w-6 min-h-6 aspect-square rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                selectedPersona === persona.id
                  ? "bg-om-heritage-green border-om-heritage-green"
                  : "border-om-grey-15"
              }`}
            >
              {selectedPersona === persona.id && (
                <div className="w-3 h-3 min-w-3 min-h-3 aspect-square rounded-full bg-white" />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <span className="text-om-grey">Region:</span>
              <div className="font-semibold text-om-navy">{persona.region}</div>
            </div>
            <div>
              <span className="text-om-grey">Occupation:</span>
              <div className="font-semibold text-om-navy">
                {persona.occupation}
              </div>
            </div>
            <div>
              <span className="text-om-grey">Monthly Income:</span>
              <div className="font-semibold text-om-navy">
                {persona.monthlyIncome}
              </div>
            </div>
            <div>
              <span className="text-om-grey">Family:</span>
              <div className="font-semibold text-om-navy">{persona.family}</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
