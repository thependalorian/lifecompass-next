// app/advisor/clients/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { CorporateLayout } from "@/components/templates/CorporateLayout";
import { motion } from "framer-motion";
import { OMButton } from "@/components/atoms/brand";

const sampleClients = [
  {
    id: "CUST-001",
    name: "Maria Shikongo",
    initials: "MS",
    segment: "Informal",
    location: "Katutura, Windhoek",
    policies: 3,
    totalPremium: 870,
    lifetimeValue: 150000,
    lastInteraction: "2 days ago",
    status: "Active",
    riskProfile: "Conservative",
  },
  {
    id: "CUST-002",
    name: "John-Paul !Gaeb",
    initials: "JG",
    segment: "SMB",
    location: "Walvis Bay",
    policies: 2,
    totalPremium: 1200,
    lifetimeValue: 85000,
    lastInteraction: "1 week ago",
    status: "Active",
    riskProfile: "Moderate",
  },
  {
    id: "CUST-003",
    name: "Fatima Isaacks",
    initials: "FI",
    segment: "Informal",
    location: "Oshakati",
    policies: 2,
    totalPremium: 450,
    lifetimeValue: 95000,
    lastInteraction: "3 days ago",
    status: "Active",
    riskProfile: "Conservative",
  },
  {
    id: "CUST-004",
    name: "David Ndjavera",
    initials: "DN",
    segment: "SMB",
    location: "Tsumeb",
    policies: 1,
    totalPremium: 650,
    lifetimeValue: 45000,
    lastInteraction: "5 days ago",
    status: "Pending",
    riskProfile: "Moderate",
  },
  {
    id: "CUST-005",
    name: "Helvi Bezuidenhout",
    initials: "HB",
    segment: "Professional",
    location: "Windhoek CBD",
    policies: 5,
    totalPremium: 3200,
    lifetimeValue: 450000,
    lastInteraction: "1 day ago",
    status: "Active",
    riskProfile: "Aggressive",
  },
];

export default function AdvisorClientsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSegment, setSelectedSegment] = useState("All");
  const [selectedClient, setSelectedClient] = useState<
    (typeof sampleClients)[0] | null
  >(null);

  const segments = ["All", "Informal", "SMB", "Professional", "Corporate"];

  const filteredClients = sampleClients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSegment =
      selectedSegment === "All" || client.segment === selectedSegment;

    return matchesSearch && matchesSegment;
  });

  return (
    <CorporateLayout
      heroTitle="Client Management"
      heroSubtitle="Search, segment, and manage your client book"
      pageType="advisor"
    >
      {/* Search & Filters */}
      <section className="container mx-auto px-4 py-6">
        <div className="card-om p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, ID, or policy..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input input-bordered w-full input-om"
              />
            </div>
            <div className="flex gap-2">
              {segments.map((segment) => (
                <button
                  key={segment}
                  onClick={() => setSelectedSegment(segment)}
                  className={`btn btn-sm ${
                    selectedSegment === segment
                      ? "btn-om-primary"
                      : "btn-outline"
                  }`}
                >
                  {segment}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Client Summary Stats */}
      <section className="container mx-auto px-4 pb-6">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="card-om bg-om-green/10">
            <div className="card-body">
              <div className="text-sm text-om-grey">Total Clients</div>
              <div className="text-3xl font-bold text-om-green">
                {filteredClients.length}
              </div>
            </div>
          </div>
          <div className="card-om bg-om-navy/10">
            <div className="card-body">
              <div className="text-sm text-om-grey">Total Policies</div>
              <div className="text-3xl font-bold text-om-navy">
                {filteredClients.reduce((sum, c) => sum + c.policies, 0)}
              </div>
            </div>
          </div>
          <div className="card-om bg-om-gold/10">
            <div className="card-body">
              <div className="text-sm text-om-grey">Monthly Premium</div>
              <div className="text-3xl font-bold text-om-gold">
                N$
                {filteredClients
                  .reduce((sum, c) => sum + c.totalPremium, 0)
                  .toLocaleString()}
              </div>
            </div>
          </div>
          <div className="card-om">
            <div className="card-body">
              <div className="text-sm text-om-grey">Total LTV</div>
              <div className="text-3xl font-bold text-om-green">
                N$
                {Math.round(
                  filteredClients.reduce((sum, c) => sum + c.lifetimeValue, 0) /
                    1000,
                )}
                K
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clients List */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          {filteredClients.map((client, idx) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setSelectedClient(client)}
              className="card-om cursor-pointer hover:shadow-xl transition-shadow"
            >
              <div className="card-body">
                {/* Client Header */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="avatar">
                    <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-om-heritage-green/20">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(client.name)}&background=009677&color=fff&size=128&bold=true&font-size=0.5`}
                        alt={client.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-om-navy">{client.name}</div>
                    <div className="text-xs text-om-grey">{client.id}</div>
                  </div>
                  <div
                    className={`badge ${client.status === "Active" ? "badge-om-active" : "badge-om-pending"}`}
                  >
                    {client.status}
                  </div>
                </div>

                {/* Client Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <div className="text-xs text-om-grey">Policies</div>
                    <div className="text-lg font-bold text-om-navy">
                      {client.policies}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-om-grey">Premium</div>
                    <div className="text-lg font-bold text-om-green">
                      N${client.totalPremium}
                    </div>
                  </div>
                </div>

                {/* Client Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <span className="text-om-grey w-24">Segment:</span>
                    <span className="badge badge-sm">{client.segment}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-om-grey w-24">Location:</span>
                    <span>{client.location}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-om-grey w-24">Last Contact:</span>
                    <span>{client.lastInteraction}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <Link href={`/advisor/client/${client.id}`} className="flex-1">
                    <OMButton variant="primary" size="sm" className="w-full">
                      View 360° Profile
                    </OMButton>
                  </Link>
                  <OMButton variant="outline" size="sm">
                    Message
                  </OMButton>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Client 360 Modal */}
      {selectedClient && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <button
              onClick={() => setSelectedClient(null)}
              className="btn btn-sm btn-circle absolute right-2 top-2"
            >
              ✕
            </button>
            <h3 className="text-2xl font-bold text-om-navy mb-6">
              Client 360° View
            </h3>

            {/* Client Profile */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="avatar">
                <div className="w-20 rounded-full bg-om-green text-white flex items-center justify-center text-2xl font-bold">
                  {selectedClient.initials}
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-om-navy">
                  {selectedClient.name}
                </h4>
                <p className="text-om-grey">{selectedClient.id}</p>
                <div className="flex gap-2 mt-2">
                  <span className="badge">{selectedClient.segment}</span>
                  <span className="badge">{selectedClient.riskProfile}</span>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="card-om bg-om-green/10">
                <div className="card-body p-4">
                  <div className="text-sm text-om-grey">Lifetime Value</div>
                  <div className="text-2xl font-bold text-om-green">
                    N${selectedClient.lifetimeValue.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="card-om bg-om-navy/10">
                <div className="card-body p-4">
                  <div className="text-sm text-om-grey">Active Policies</div>
                  <div className="text-2xl font-bold text-om-navy">
                    {selectedClient.policies}
                  </div>
                </div>
              </div>
              <div className="card-om bg-om-gold/10">
                <div className="card-body p-4">
                  <div className="text-sm text-om-grey">Monthly Premium</div>
                  <div className="text-2xl font-bold text-om-gold">
                    N${selectedClient.totalPremium}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="tabs tabs-boxed mb-4">
              <a className="tab tab-active">Policies</a>
              <a className="tab">Interactions</a>
              <a className="tab">Tasks</a>
              <a className="tab">Notes</a>
            </div>

            {/* Content Area */}
            <div className="bg-base-200 rounded-lg p-4 mb-6 min-h-[200px]">
              <p className="text-om-grey text-center py-8">
                Policy details and interaction history would appear here
              </p>
            </div>

            {/* Actions */}
            <div className="modal-action">
              <Link href={`/advisors/ADV001/book`} className="btn btn-om-primary">Schedule Meeting</Link>
              <button className="btn btn-om-outline">Send Message</button>
              <button className="btn btn-ghost">Add Note</button>
            </div>
          </div>
        </div>
      )}
    </CorporateLayout>
  );
}
