/**
 * Customer Profile Page
 * Location: /app/customer/profile/[id]/page.tsx
 * Purpose: Display selected customer persona profile and provide navigation to customer experience
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
  CurrencyDollarIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";

export default function CustomerProfilePage() {
  const router = useRouter();
  const params = useParams();
  const personaId = params.id as string;
  const [persona, setPersona] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch customer from API
    const fetchCustomer = async () => {
      try {
        const response = await fetch(`/api/customers?number=${personaId}`);
        if (!response.ok) {
          if (response.status === 404) {
            router.push("/customer/select");
            return;
          }
          throw new Error("Failed to fetch customer");
        }
        const data = await response.json();
        // Transform data to match expected format
        const transformed = {
          ...data,
          role: data.occupation || data.segment,
          location: data.city ? `${data.city}, ${data.region}` : data.region,
          monthlyIncome: data.monthlyIncome 
            ? `N$${data.monthlyIncome.toLocaleString()}` 
            : "Not specified",
          family: data.maritalStatus 
            ? `${data.maritalStatus}${data.dependentsCount > 0 ? `, ${data.dependentsCount} ${data.dependentsCount === 1 ? 'child' : 'children'}` : ''}`
            : "Not specified",
          age: data.dateOfBirth 
            ? new Date().getFullYear() - new Date(data.dateOfBirth).getFullYear()
            : null,
          financialSituation: `${data.segment} customer`,
          digitalAdoption: data.digitalAdoption || "Not specified",
          challenges: `${data.segment} customer challenges`,
          advisorNeed: `Services for ${data.segment} customers`,
        };
        setPersona(transformed);
        // Store in sessionStorage for use across the customer experience
        sessionStorage.setItem("selectedCustomerPersona", personaId);
        sessionStorage.setItem("customerPersonaData", JSON.stringify(transformed));
      } catch (err) {
        console.error("Error fetching customer:", err);
        setError("Failed to load customer. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (personaId) {
      fetchCustomer();
    }
  }, [personaId, router]);

  if (loading) {
    return (
      <CorporateLayout
        heroTitle="Loading..."
        pageType="customer"
        showBreadcrumbs={true}
        breadcrumbItems={[
          { label: "Customer", href: "/customer/select" },
          { label: "Profile", href: `/customer/profile/${personaId}` },
        ]}
      >
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="loading loading-spinner loading-lg text-om-heritage-green"></div>
          <p className="mt-4 text-om-grey">Loading customer profile...</p>
        </div>
      </CorporateLayout>
    );
  }

  if (error || !persona) {
    return (
      <CorporateLayout
        heroTitle="Error"
        pageType="customer"
        showBreadcrumbs={true}
        breadcrumbItems={[
          { label: "Customer", href: "/customer/select" },
          { label: "Profile", href: `/customer/profile/${personaId}` },
        ]}
      >
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="alert alert-error">
            <span>{error || "Customer not found"}</span>
          </div>
          <OMButton
            variant="primary"
            onClick={() => router.push("/customer/select")}
            className="mt-4"
          >
            Back to Customer Selection
          </OMButton>
        </div>
      </CorporateLayout>
    );
  }

  return (
    <CorporateLayout
      heroTitle={`${persona.name}'s Profile`}
      heroSubtitle={persona.role}
      pageType="customer"
      showBreadcrumbs={true}
      breadcrumbItems={[
        { label: "Customer", href: "/customer/select" },
        { label: persona.name || "Profile", href: `/customer/profile/${personaId}` },
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
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-om-heritage-green to-om-fresh-green flex items-center justify-center text-white text-3xl font-bold ring-4 ring-om-heritage-green/20">
                  {persona.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-om-navy mb-1">
                    {persona.name}
                  </h1>
                  <p className="text-lg text-om-grey">{persona.role}</p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-om-navy mb-6">
                Profile Overview
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="w-5 h-5 text-om-heritage-green mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-om-grey">Location</p>
                      <p className="font-semibold text-om-navy">{persona.location}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <BriefcaseIcon className="w-5 h-5 text-om-heritage-green mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-om-grey">Occupation</p>
                      <p className="font-semibold text-om-navy">{persona.occupation}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CurrencyDollarIcon className="w-5 h-5 text-om-heritage-green mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-om-grey">Monthly Income</p>
                      <p className="font-semibold text-om-navy">{persona.monthlyIncome}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <UserIcon className="w-5 h-5 text-om-heritage-green mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-om-grey">Family</p>
                      <p className="font-semibold text-om-navy">{persona.family}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <HomeIcon className="w-5 h-5 text-om-heritage-green mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-om-grey">Financial Situation</p>
                      <p className="font-semibold text-om-navy">{persona.financialSituation}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-om-grey mb-2">Age</p>
                    <p className="font-semibold text-om-navy">{persona.age} years old</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Additional Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-om mb-8"
          >
            <div className="card-body">
              <h2 className="text-2xl font-bold text-om-navy mb-4">
                Additional Information
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-om-grey mb-1">Digital Adoption</p>
                  <p className="text-om-navy">{persona.digitalAdoption}</p>
                </div>
                <div>
                  <p className="text-sm text-om-grey mb-1">Challenges</p>
                  <p className="text-om-navy">{persona.challenges}</p>
                </div>
                <div>
                  <p className="text-sm text-om-grey mb-1">Advisor Needs</p>
                  <p className="text-om-navy">{persona.advisorNeed}</p>
                </div>
              </div>
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
                Start Your Experience
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Link href="/chat">
                  <OMButton variant="primary" size="lg" className="w-full">
                    Chat with LifeCompass
                  </OMButton>
                </Link>
                <Link href="/products">
                  <OMButton variant="primary" size="lg" className="w-full">
                    Browse Products
                  </OMButton>
                </Link>
                <Link href="/claims">
                  <OMButton variant="outline" size="lg" className="w-full">
                    File a Claim
                  </OMButton>
                </Link>
                <Link href="/advisors">
                  <OMButton variant="outline" size="lg" className="w-full">
                    Find an Advisor
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

