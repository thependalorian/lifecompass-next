// app/advisor/client/[id]/page.tsx
// Client 360° View - Advisor Command Center Flow

"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { CorporateLayout } from "@/components/templates/CorporateLayout";
import { motion } from "framer-motion";
import {
  UserGroupIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ClockIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  PencilIcon,
  BookmarkIcon,
} from "@heroicons/react/24/outline";
import { OMButton } from "@/components/atoms/brand";

interface Client {
  id: string;
  customerNumber: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  occupation: string;
  city: string;
  region: string;
  segment: string;
  engagementScore: number;
  lifetimeValue: number;
  churnRisk: string;
  primaryAdvisorId?: string | null;
}

interface Policy {
  id: string;
  policyNumber: string;
  type: string;
  subtype: string;
  status: string;
  coverageAmount: number | null;
  premiumAmount: number | null;
  premiumFrequency: string;
  startDate: string;
  endDate: string | null;
  renewalDate: string | null;
}

interface Interaction {
  id: string;
  interactionNumber: string;
  type: string;
  channel: string;
  direction: string;
  subject: string;
  content: string;
  sentiment: string;
  intent: string;
  outcome: string;
  createdAt: string;
}

export default function Client360Page() {
  const params = useParams();
  const customerNumber = params.id as string;
  const [client, setClient] = useState<Client | null>(null);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "policies" | "interactions" | "notes">("overview");

  useEffect(() => {
    if (!customerNumber) return;

    const fetchClientData = async () => {
      setLoading(true);
      try {
        // Fetch client data
        const clientResponse = await fetch(`/api/customers?number=${customerNumber}`);
        if (!clientResponse.ok) throw new Error("Failed to fetch client");
        const clientData = await clientResponse.json();
        setClient(clientData);

        // Fetch policies
        const policiesResponse = await fetch(`/api/policies?customerNumber=${customerNumber}`);
        if (policiesResponse.ok) {
          const policiesData = await policiesResponse.json();
          setPolicies(policiesData);
        }

        // Fetch interactions
        const interactionsResponse = await fetch(`/api/interactions?customerNumber=${customerNumber}&limit=10`);
        if (interactionsResponse.ok) {
          const interactionsData = await interactionsResponse.json();
          setInteractions(interactionsData);
        }
      } catch (err) {
        console.error("Error fetching client data:", err);
        setError("Failed to load client data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [customerNumber]);

  if (loading) {
    return (
      <CorporateLayout
        heroTitle="Client 360° View"
        heroSubtitle="Loading..."
        pageType="advisor"
      >
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="loading loading-spinner loading-lg text-om-green"></div>
        </div>
      </CorporateLayout>
    );
  }

  if (error || !client) {
    return (
      <CorporateLayout
        heroTitle="Client 360° View"
        heroSubtitle="Error"
        pageType="advisor"
      >
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="alert alert-error">{error || "Client not found"}</div>
        </div>
      </CorporateLayout>
    );
  }

  // Calculate totals from policies
  const totalPolicies = policies.length;
  const totalPremium = policies
    .filter((p) => p.status === "Active")
    .reduce((sum, p) => sum + (p.premiumAmount || 0), 0);

  return (
    <CorporateLayout
      heroTitle={client.name}
      heroSubtitle={`${client.customerNumber} | ${client.segment} Segment`}
      pageType="advisor"
      showBreadcrumbs={true}
      breadcrumbItems={[
        { label: "Advisor", href: "/advisor/select" },
        { label: "Dashboard", href: "/advisor" },
        { label: "Clients", href: "/advisor/clients" },
        { label: client.name, href: `/advisor/client/${client.customerNumber}` },
      ]}
    >
      {/* Action Buttons */}
      <section className="bg-om-heritage-green text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-end gap-3">
            {client.primaryAdvisorId ? (
              <Link href={`/advisors/${client.primaryAdvisorId}/book?client=${encodeURIComponent(client.customerNumber)}`}>
                <OMButton variant="outline" size="sm" className="border-white text-white hover:bg-white hover:text-om-heritage-green">
                  Schedule Meeting
                </OMButton>
              </Link>
            ) : (
              <Link href={`/advisors`}>
                <OMButton variant="outline" size="sm" className="border-white text-white hover:bg-white hover:text-om-heritage-green">
                  Find Advisor
                </OMButton>
              </Link>
            )}
            <Link href="/advisor/communicate">
              <OMButton variant="primary" size="sm">
                Send Message
              </OMButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="bg-white border-b border-om-grey-15">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto">
            {[
              { id: "overview", label: "Overview", icon: ChartBarIcon },
              { id: "policies", label: "Policies", icon: ShieldCheckIcon },
              { id: "interactions", label: "Interactions", icon: ChatBubbleLeftRightIcon },
              { id: "notes", label: "Notes", icon: DocumentTextIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-om-heritage-green text-om-heritage-green"
                    : "border-transparent text-om-grey-60 hover:text-om-heritage-green"
                }`}
              >
                <tab.icon className="w-5 h-5 inline-block mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {activeTab === "overview" && (
              <>
                {/* Key Metrics */}
                <div className="card-om p-6">
                  <h2 className="text-xl font-bold text-om-navy mb-4">Key Metrics</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-om-grey-60 mb-1">Total Policies</div>
                      <div className="text-2xl font-bold text-om-heritage-green">
                        {totalPolicies}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-om-grey-60 mb-1">Total Premium</div>
                      <div className="text-2xl font-bold text-om-heritage-green">
                        N$ {totalPremium.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-om-grey-60 mb-1">Lifetime Value</div>
                      <div className="text-2xl font-bold text-om-heritage-green">
                        N$ {Math.round(client.lifetimeValue / 1000)}K
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-om-grey-60 mb-1">Engagement Score</div>
                      <div className="text-2xl font-bold text-om-heritage-green">
                        {Math.round(client.engagementScore)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial Overview */}
                <div className="card-om p-6">
                  <h2 className="text-xl font-bold text-om-navy mb-4 flex items-center gap-2">
                    <CurrencyDollarIcon className="w-6 h-6 text-om-heritage-green" />
                    Financial Overview
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-om-grey-80">Monthly Premium</span>
                        <span className="font-bold text-om-navy">N$ {totalPremium.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-om-grey-15 rounded-full h-2">
                        <div className="bg-om-heritage-green h-2 rounded-full" style={{ width: `${Math.min(client.engagementScore, 100)}%` }} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-om-grey-15">
                      <div>
                        <div className="text-sm text-om-grey-60">Segment</div>
                        <div className="font-bold text-om-navy">{client.segment}</div>
                      </div>
                      <div>
                        <div className="text-sm text-om-grey-60">Churn Risk</div>
                        <div className={`font-bold ${
                          client.churnRisk === "Low" ? "text-om-fresh-green" :
                          client.churnRisk === "Medium" ? "text-om-naartjie" : "text-om-cerise"
                        }`}>
                          {client.churnRisk}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "policies" && (
              <div className="space-y-4">
                {policies.length > 0 ? (
                  policies.map((policy) => (
                    <div key={policy.id} className="card-om p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-om-navy">{policy.type} {policy.subtype ? `- ${policy.subtype}` : ""}</h3>
                          <p className="text-sm text-om-grey-60">{policy.policyNumber}</p>
                        </div>
                        <span className={`badge ${
                          policy.status === "Active" ? "badge-om-active" : "badge-om-inactive"
                        }`}>
                          {policy.status}
                        </span>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-om-grey-60">Premium</div>
                          <div className="font-bold text-om-navy">
                            N$ {policy.premiumAmount ? policy.premiumAmount.toLocaleString() : "0"} / {policy.premiumFrequency || "Monthly"}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-om-grey-60">Coverage</div>
                          <div className="font-bold text-om-navy">
                            N$ {policy.coverageAmount ? policy.coverageAmount.toLocaleString() : "N/A"}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-om-grey-60">Renewal Date</div>
                          <div className="font-bold text-om-navy">
                            {policy.renewalDate ? new Date(policy.renewalDate).toLocaleDateString() : "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-om-grey">
                    No policies found
                  </div>
                )}
              </div>
            )}

            {activeTab === "interactions" && (
              <div className="space-y-4">
                {interactions.length > 0 ? (
                  interactions.map((interaction) => (
                    <div key={interaction.id} className="card-om p-6">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-om-navy">{interaction.subject || "No subject"}</h3>
                          <p className="text-sm text-om-grey-60">
                            {new Date(interaction.createdAt).toLocaleDateString()} at {new Date(interaction.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <span className={`badge ${
                          interaction.sentiment === "Positive" ? "badge-om-success" :
                          interaction.sentiment === "Negative" ? "badge-om-error" : "badge-om-info"
                        }`}>
                          {interaction.sentiment || "Neutral"}
                        </span>
                      </div>
                      <div className="flex gap-4 text-sm text-om-grey-60 mb-2">
                        <span>{interaction.type}</span>
                        <span>•</span>
                        <span>{interaction.channel}</span>
                        <span>•</span>
                        <span>{interaction.direction}</span>
                        <span>•</span>
                        <span className="font-semibold text-om-heritage-green">{interaction.outcome || "N/A"}</span>
                      </div>
                      {interaction.content && (
                        <p className="text-sm text-om-grey-80 mt-2">{interaction.content}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-om-grey">
                    No interactions found
                  </div>
                )}
              </div>
            )}

            {activeTab === "notes" && (
              <div className="space-y-4">
                {/* Add Note */}
                <div className="card-om p-6">
                  <h3 className="font-bold text-om-navy mb-4">Add Private Note</h3>
                  <textarea
                    placeholder="Add a note about this client..."
                    className="textarea textarea-bordered w-full input-om mb-3"
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <OMButton variant="primary" size="sm">
                      Save Note
                    </OMButton>
                    <OMButton variant="outline" size="sm">
                      Clear
                    </OMButton>
                  </div>
                </div>

                {/* Existing Notes */}
                <div className="text-center py-12 text-om-grey">
                  <p>Notes feature coming soon. Notes will be stored in the database.</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Summary */}
            <div className="card-om p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-om-heritage-green text-white flex items-center justify-center font-bold text-xl aspect-square">
                  {client.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <h3 className="font-bold text-om-navy">{client.name}</h3>
                  <p className="text-sm text-om-grey-60">{client.segment} Segment</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-om-grey-80">
                  <UserGroupIcon className="w-4 h-4" />
                  {client.occupation}
                </div>
                <div className="flex items-center gap-2 text-om-grey-80">
                  <ClockIcon className="w-4 h-4" />
                  {client.city}, {client.region}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="card-om p-6">
              <h3 className="font-bold text-om-navy mb-4">Contact Information</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <div className="text-om-grey-60">Email</div>
                  <div className="font-semibold text-om-navy">{client.email}</div>
                </div>
                <div>
                  <div className="text-om-grey-60">Phone</div>
                  <div className="font-semibold text-om-navy">{client.phone}</div>
                </div>
                <div>
                  <div className="text-om-grey-60">Date of Birth</div>
                  <div className="font-semibold text-om-navy">{client.dateOfBirth}</div>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="card-om p-6">
              <h3 className="font-bold text-om-navy mb-4 flex items-center gap-2">
                <CalendarDaysIcon className="w-5 h-5 text-om-heritage-green" />
                Account Information
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <div className="text-om-grey-60">Customer Number</div>
                  <div className="font-semibold text-om-navy">{client.customerNumber}</div>
                </div>
                <div>
                  <div className="text-om-grey-60">Date of Birth</div>
                  <div className="font-semibold text-om-navy">
                    {client.dateOfBirth ? new Date(client.dateOfBirth).toLocaleDateString() : "N/A"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </CorporateLayout>
  );
}

