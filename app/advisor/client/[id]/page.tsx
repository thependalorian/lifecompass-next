// app/advisor/client/[id]/page.tsx
// Client 360° View - Advisor Command Center Flow

"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
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

// Sample client data - in production, fetch from API using [id]
const sampleClient = {
  id: "CLI001",
  name: "Maria Shikongo",
  email: "maria.shikongo@oldmutual.na",
  phone: "+264811234567",
  dateOfBirth: "1982-05-15",
  occupation: "Small Business Owner",
  location: "Katutura, Windhoek",
  segment: "SME",
  riskProfile: "Moderate",
  totalPolicies: 3,
  totalPremium: 2550,
  lifetimeValue: 76500,
  engagementScore: 82,
  churnRisk: "Low",
  lastContact: "2025-11-01",
  nextReview: "2026-04-15",
  primaryAdvisor: "Thomas Shikongo",
  advisorId: "ADV001",
  products: ["OMP Funeral Insurance", "OMP Severe Illness Cover", "Unit Trusts"],
  lastPolicyUpdate: "2025-10-15",
};

const policies = [
  {
    id: "OMP-FUN-001",
    type: "OMP Funeral Insurance",
    number: "OMP-FUN-2023-001",
    status: "Active",
    premium: 350,
    coverage: 50000,
    renewalDate: "2025-03-15",
    description: "Comprehensive+ Plan - Extended family coverage with cashback benefits",
  },
  {
    id: "OMP-SIC-002",
    type: "OMP Severe Illness Cover",
    number: "OMP-SIC-2023-045",
    status: "Active",
    premium: 1200,
    coverage: 200000,
    renewalDate: "2025-06-01",
    description: "Coverage for 68 severe illnesses with lump sum payments",
  },
  {
    id: "UT-INCOME-003",
    type: "Old Mutual Namibia Income Fund",
    number: "UT-INC-2024-012",
    status: "Active",
    premium: 1000,
    coverage: 0,
    renewalDate: "2025-12-31",
    description: "Monthly investment - Professional management with 7.2% annual returns",
  },
];

const interactions = [
  {
    id: "INT001",
    date: "2025-11-01",
    type: "Chat",
    channel: "Web",
    subject: "OMP Severe Illness Cover claim inquiry",
    outcome: "Resolved",
    sentiment: "Positive",
    notes: "Client inquired about claim process for severe illness coverage",
  },
  {
    id: "INT002",
    date: "2025-10-28",
    type: "Call",
    channel: "Phone",
    subject: "Unit Trust investment review",
    outcome: "Follow-up Scheduled",
    sentiment: "Positive",
    notes: "Discussed Old Mutual Income Fund performance and additional contributions",
  },
  {
    id: "INT003",
    date: "2025-10-15",
    type: "Meeting",
    channel: "In-Person",
    subject: "Annual review",
    outcome: "Follow-up Needed",
    sentiment: "Neutral",
  },
];

const notes = [
  {
    id: "NOTE001",
    date: "2024-10-20",
    content: "Interested in education savings for 3 children. Good opportunity for upsell.",
    pinned: true,
  },
  {
    id: "NOTE002",
    date: "2024-09-28",
    content: "Stable income from food vending business. Reliable premium payments.",
    pinned: false,
  },
];

export default function Client360Page() {
  const params = useParams();
  const clientId = params.id as string;
  const [activeTab, setActiveTab] = useState<"overview" | "policies" | "interactions" | "notes">("overview");
  const [newNote, setNewNote] = useState("");

  // In production, fetch client data based on clientId
  const client = sampleClient;

  return (
    <CorporateLayout
      heroTitle={client.name}
      heroSubtitle={`Client ID: ${client.id} | ${client.segment} Segment`}
      pageType="advisor"
    >
      {/* Action Buttons */}
      <section className="bg-om-heritage-green text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-end gap-3">
            <Link href={`/advisors/${client.advisorId}/book`}>
              <OMButton variant="outline" size="sm" className="border-white text-white hover:bg-white hover:text-om-heritage-green">
                Schedule Meeting
              </OMButton>
            </Link>
            <OMButton variant="primary" size="sm">
              Send Message
            </OMButton>
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
                        {client.totalPolicies}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-om-grey-60 mb-1">Total Premium</div>
                      <div className="text-2xl font-bold text-om-heritage-green">
                        N$ {client.totalPremium.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-om-grey-60 mb-1">Lifetime Value</div>
                      <div className="text-2xl font-bold text-om-heritage-green">
                        N$ {(client.lifetimeValue / 1000).toFixed(0)}K
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-om-grey-60 mb-1">Engagement Score</div>
                      <div className="text-2xl font-bold text-om-heritage-green">
                        {client.engagementScore}
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
                        <span className="font-bold text-om-navy">N$ {client.totalPremium.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-om-grey-15 rounded-full h-2">
                        <div className="bg-om-heritage-green h-2 rounded-full" style={{ width: "85%" }} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-om-grey-15">
                      <div>
                        <div className="text-sm text-om-grey-60">Risk Profile</div>
                        <div className="font-bold text-om-navy">{client.riskProfile}</div>
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
                {policies.map((policy) => (
                  <div key={policy.id} className="card-om p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-om-navy">{policy.type}</h3>
                        <p className="text-sm text-om-grey-60">{policy.number}</p>
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
                        <div className="font-bold text-om-navy">N$ {policy.premium.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-om-grey-60">Coverage</div>
                        <div className="font-bold text-om-navy">N$ {policy.coverage.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-om-grey-60">Renewal Date</div>
                        <div className="font-bold text-om-navy">{policy.renewalDate}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "interactions" && (
              <div className="space-y-4">
                {interactions.map((interaction) => (
                  <div key={interaction.id} className="card-om p-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-om-navy">{interaction.subject}</h3>
                        <p className="text-sm text-om-grey-60">{interaction.date}</p>
                      </div>
                      <span className={`badge ${
                        interaction.sentiment === "Positive" ? "badge-om-success" :
                        interaction.sentiment === "Negative" ? "badge-om-error" : "badge-om-info"
                      }`}>
                        {interaction.sentiment}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm text-om-grey-60">
                      <span>{interaction.type}</span>
                      <span>•</span>
                      <span>{interaction.channel}</span>
                      <span>•</span>
                      <span className="font-semibold text-om-heritage-green">{interaction.outcome}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "notes" && (
              <div className="space-y-4">
                {/* Add Note */}
                <div className="card-om p-6">
                  <h3 className="font-bold text-om-navy mb-4">Add Private Note</h3>
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note about this client..."
                    className="textarea textarea-bordered w-full input-om mb-3"
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <OMButton variant="primary" size="sm">
                      Save Note
                    </OMButton>
                    <OMButton variant="outline" size="sm" onClick={() => setNewNote("")}>
                      Clear
                    </OMButton>
                  </div>
                </div>

                {/* Existing Notes */}
                {notes.map((note) => (
                  <div key={note.id} className="card-om p-6">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        {note.pinned && <BookmarkIcon className="w-5 h-5 text-om-naartjie" />}
                        <span className="text-sm text-om-grey-60">{note.date}</span>
                      </div>
                      <button className="btn btn-ghost btn-sm">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-om-grey-80">{note.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Summary */}
            <div className="card-om p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-om-heritage-green text-white flex items-center justify-center font-bold text-xl">
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
                  {client.location}
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

            {/* Key Dates */}
            <div className="card-om p-6">
              <h3 className="font-bold text-om-navy mb-4 flex items-center gap-2">
                <CalendarDaysIcon className="w-5 h-5 text-om-heritage-green" />
                Key Dates
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <div className="text-om-grey-60">Last Contact</div>
                  <div className="font-semibold text-om-navy">{client.lastContact}</div>
                </div>
                <div>
                  <div className="text-om-grey-60">Next Review</div>
                  <div className="font-semibold text-om-heritage-green">{client.nextReview}</div>
                </div>
              </div>
            </div>

            {/* Primary Advisor */}
            <div className="card-om p-6">
              <h3 className="font-bold text-om-navy mb-4">Primary Advisor</h3>
              <div className="text-sm">
                <div className="font-semibold text-om-heritage-green">{client.primaryAdvisor}</div>
                <div className="text-om-grey-60">Informal Sector Specialist</div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </CorporateLayout>
  );
}

