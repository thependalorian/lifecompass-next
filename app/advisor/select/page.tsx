/**
 * Advisor Persona Selection Page
 * Location: /app/advisor/select/page.tsx
 * Purpose: Allow users to select an advisor persona before accessing the advisor experience
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CorporateLayout } from "@/components/templates/CorporateLayout";
import { OMButton } from "@/components/atoms/brand";
import { motion } from "framer-motion";
import {
  UserIcon,
  BriefcaseIcon,
  MapPinIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

export default function AdvisorPersonaSelection() {
  const router = useRouter();
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const [advisorPersonas, setAdvisorPersonas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch advisors from API
    const fetchAdvisors = async () => {
      try {
        const response = await fetch("/api/advisors");
        if (!response.ok) {
          throw new Error("Failed to fetch advisors");
        }
        const data = await response.json();
        setAdvisorPersonas(data);
      } catch (err) {
        console.error("Error fetching advisors:", err);
        setError("Failed to load advisors. Please try again.");
        // Fallback to empty array
        setAdvisorPersonas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvisors();
  }, []);

  const handleContinue = () => {
    if (selectedPersona) {
      // Store selected persona in sessionStorage
      sessionStorage.setItem("selectedAdvisorPersona", selectedPersona);
      // Navigate to advisor profile page
      router.push(`/advisor/profile/${selectedPersona}`);
    }
  };

  if (loading) {
    return (
      <CorporateLayout
        heroTitle="Loading Advisors..."
        heroSubtitle="Please wait while we load advisor information"
        pageType="advisor"
        showChat={false}
      >
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto text-center">
            <div className="loading loading-spinner loading-lg text-om-heritage-green"></div>
            <p className="mt-4 text-om-grey">Loading advisors...</p>
          </div>
        </section>
      </CorporateLayout>
    );
  }

  if (error) {
    return (
      <CorporateLayout
        heroTitle="Error Loading Advisors"
        heroSubtitle={error}
        pageType="advisor"
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
      heroTitle="Select Your Advisor Persona"
      heroSubtitle="Choose an advisor persona to explore the LifeCompass advisor experience"
      pageType="advisor"
      showChat={false}
    >
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <p className="text-lg text-om-grey text-center max-w-2xl mx-auto">
              Select an advisor persona to experience LifeCompass from their perspective. 
              Each advisor has unique specializations and manages a portfolio of clients.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {advisorPersonas.map((persona, idx) => (
              <motion.div
                key={persona.id}
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
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-om-heritage-green/20 flex-shrink-0">
                      {persona.avatarUrl ? (
                        <img
                          src={persona.avatarUrl}
                          alt={persona.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to initials if image fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            const parent = target.parentElement;
                            if (parent) {
                              parent.className = "w-16 h-16 rounded-full bg-gradient-to-br from-om-heritage-green to-om-fresh-green flex items-center justify-center text-white text-xl font-bold ring-2 ring-om-heritage-green/20 flex-shrink-0";
                              parent.textContent = persona.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2);
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-om-heritage-green to-om-fresh-green flex items-center justify-center text-white text-xl font-bold">
                          {persona.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-om-navy mb-1">
                          {persona.name}
                        </h3>
                        <p className="text-sm text-om-heritage-green font-semibold">
                          {persona.specialization}
                        </p>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
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
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2 text-om-grey">
                      <BriefcaseIcon className="w-4 h-4 flex-shrink-0" />
                      <span>{persona.experience} experience</span>
                    </div>
                    <div className="flex items-center gap-2 text-om-grey">
                      <UserGroupIcon className="w-4 h-4 flex-shrink-0" />
                      <span>{persona.clients} active clients</span>
                    </div>
                    <div className="flex items-center gap-2 text-om-grey">
                      <MapPinIcon className="w-4 h-4 flex-shrink-0" />
                      <span>{persona.location}</span>
                    </div>
                  </div>

                  <p className="text-sm text-om-grey">{persona.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
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

