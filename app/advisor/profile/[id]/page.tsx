/**
 * Advisor Profile Page
 * Location: /app/advisor/profile/[id]/page.tsx
 * Purpose: Display selected advisor persona profile and provide navigation to advisor experience
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { CorporateLayout } from "@/components/templates/CorporateLayout";
import { OMButton } from "@/components/atoms/brand";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  UserIcon,
  BriefcaseIcon,
  MapPinIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

export default function AdvisorProfilePage() {
  const router = useRouter();
  const params = useParams();
  const personaId = params.id as string;
  const [persona, setPersona] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch advisor from API
    const fetchAdvisor = async () => {
      try {
        const response = await fetch(`/api/advisors?number=${personaId}`);
        if (!response.ok) {
          if (response.status === 404) {
            router.push("/advisor/select");
            return;
          }
          throw new Error("Failed to fetch advisor");
        }
        const data = await response.json();
        setPersona(data);
        // Store in sessionStorage for use across the advisor experience
        sessionStorage.setItem("selectedAdvisorPersona", personaId);
        sessionStorage.setItem("advisorPersonaData", JSON.stringify(data));
      } catch (err) {
        console.error("Error fetching advisor:", err);
        setError("Failed to load advisor. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (personaId) {
      fetchAdvisor();
    }
  }, [personaId, router]);

  if (loading) {
    return (
      <CorporateLayout heroTitle="Loading..." pageType="advisor">
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="loading loading-spinner loading-lg text-om-heritage-green"></div>
          <p className="mt-4 text-om-grey">Loading advisor profile...</p>
        </div>
      </CorporateLayout>
    );
  }

  if (error || !persona) {
    return (
      <CorporateLayout heroTitle="Error" pageType="advisor">
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="alert alert-error">
            <span>{error || "Advisor not found"}</span>
          </div>
          <OMButton
            variant="primary"
            onClick={() => router.push("/advisor/select")}
            className="mt-4"
          >
            Back to Advisor Selection
          </OMButton>
        </div>
      </CorporateLayout>
    );
  }

  // Calculate progress percentage with safety checks
  const currentSales = typeof persona.currentSales === 'number' ? persona.currentSales : 0;
  const monthlyTarget = typeof persona.monthlyTarget === 'number' && persona.monthlyTarget > 0 ? persona.monthlyTarget : 1;
  const progressPercentage = Math.min((currentSales / monthlyTarget) * 100, 100);
  const conversionRate = typeof persona.conversionRate === 'number' ? persona.conversionRate : 0;

  return (
    <CorporateLayout
      heroTitle={`${persona.name}'s Profile`}
      heroSubtitle={persona.specialization}
      pageType="advisor"
      showBreadcrumbs={true}
      breadcrumbItems={[
        { label: "Advisor", href: "/advisor/select" },
        { label: "Dashboard", href: "/advisor" },
        { label: persona.name, href: `/advisor/profile/${persona.id}` },
      ]}
    >
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Profile Overview Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-om mb-8"
          >
            <div className="card-body">
              {/* Avatar Section */}
              <div className="flex items-center gap-6 mb-8 pb-6 border-b border-base-300">
                <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-om-heritage-green/20 aspect-square">
                  {persona.avatarUrl ? (
                    <img
                      src={persona.avatarUrl}
                      alt={persona.name}
                      className="w-full h-full object-cover aspect-square"
                      onError={(e) => {
                        // Fallback to initials if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const parent = target.parentElement;
                        if (parent) {
                          parent.className = "w-24 h-24 rounded-full bg-gradient-to-br from-om-heritage-green to-om-fresh-green flex items-center justify-center text-white text-3xl font-bold ring-4 ring-om-heritage-green/20 aspect-square";
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
                    <div className="w-full h-full bg-gradient-to-br from-om-heritage-green to-om-fresh-green flex items-center justify-center text-white text-3xl font-bold aspect-square">
                      {persona.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-om-navy mb-1">
                    {persona.name}
                  </h1>
                  <p className="text-lg text-om-heritage-green font-semibold">
                    {persona.specialization}
                  </p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-om-navy mb-6">
                Profile Overview
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <BriefcaseIcon className="w-5 h-5 text-om-heritage-green mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-om-grey">Specialization</p>
                      <p className="font-semibold text-om-navy">{persona.specialization}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="w-5 h-5 text-om-heritage-green mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-om-grey">Location</p>
                      <p className="font-semibold text-om-navy">{persona.location}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <UserGroupIcon className="w-5 h-5 text-om-heritage-green mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-om-grey">Active Clients</p>
                      <p className="font-semibold text-om-navy">
                        {typeof persona.clients === 'number' ? persona.clients : persona.activeClients || 0}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-om-grey mb-1">Experience</p>
                    <p className="font-semibold text-om-navy">{persona.experience}</p>
                  </div>
                  <div>
                    <p className="text-sm text-om-grey mb-1">Monthly Sales Progress</p>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 bg-om-light-grey rounded-full h-3">
                        <div
                          className="bg-om-heritage-green h-3 rounded-full transition-all duration-500"
                          style={{ width: `${Math.round(progressPercentage)}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-om-navy whitespace-nowrap">
                        {Math.round(progressPercentage)}%
                      </span>
                    </div>
                    <p className="text-xs text-om-grey">
                      N${currentSales.toLocaleString('en-US')} / N${monthlyTarget.toLocaleString('en-US')}
                    </p>
                    {monthlyTarget > 0 && (
                      <p className="text-xs text-om-grey mt-1">
                        N${(monthlyTarget - currentSales).toLocaleString('en-US')} remaining
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-om-grey mb-1">Conversion Rate</p>
                    <p className="font-semibold text-om-navy">
                      {typeof conversionRate === 'number' ? `${conversionRate.toFixed(1)}%` : 'N/A'}
                    </p>
                  </div>
                  {persona.satisfactionScore !== undefined && (
                    <div>
                      <p className="text-sm text-om-grey mb-1">Satisfaction Score</p>
                      <p className="font-semibold text-om-navy">
                        {typeof persona.satisfactionScore === 'number' 
                          ? `${(persona.satisfactionScore / 20).toFixed(1)}/5.0` 
                          : 'N/A'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-om mb-8"
          >
            <div className="card-body">
              <h2 className="text-2xl font-bold text-om-navy mb-4">
                About
              </h2>
              <p className="text-om-grey">{persona.description}</p>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-om"
          >
            <div className="card-body">
              <h2 className="text-2xl font-bold text-om-navy mb-6">
                Access Advisor Dashboard
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Link href="/advisor">
                  <OMButton variant="primary" size="lg" className="w-full">
                    View Dashboard
                  </OMButton>
                </Link>
                <Link href="/advisor/clients">
                  <OMButton variant="primary" size="lg" className="w-full">
                    Manage Clients
                  </OMButton>
                </Link>
                <Link href="/advisor/tasks">
                  <OMButton variant="outline" size="lg" className="w-full">
                    View Tasks
                  </OMButton>
                </Link>
                <Link href="/advisor/insights">
                  <OMButton variant="outline" size="lg" className="w-full">
                    View Insights
                  </OMButton>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </CorporateLayout>
  );
}

