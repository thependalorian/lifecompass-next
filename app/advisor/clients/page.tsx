// app/advisor/clients/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CorporateLayout } from "@/components/templates/CorporateLayout";
import { motion } from "framer-motion";
import { OMButton } from "@/components/atoms/brand";

interface Client {
  id: string;
  customerNumber: string;
  name: string;
  firstName: string;
  lastName: string;
  segment: string;
  engagementScore: number;
  lifetimeValue: number;
  advisorId?: string;
}

export default function AdvisorClientsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSegment, setSelectedSegment] = useState("All");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if persona is selected
    const selectedPersona = sessionStorage.getItem("selectedAdvisorPersona");
    if (!selectedPersona) {
      router.push("/advisor/select");
      return;
    }

    // Fetch clients from API
    const fetchClients = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/advisors/${selectedPersona}/clients`);
        if (!response.ok) throw new Error("Failed to fetch clients");
        const data = await response.json();
        setClients(data);
      } catch (err) {
        console.error("Error fetching clients:", err);
        setError("Failed to load clients. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [router]);

  const segments = ["All", "Informal", "SMB", "Professional", "Corporate"];

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.customerNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSegment =
      selectedSegment === "All" || client.segment === selectedSegment;

    return matchesSearch && matchesSegment;
  });

  // Helper to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <CorporateLayout
        heroTitle="Client Management"
        heroSubtitle="Loading..."
        pageType="advisor"
      >
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="loading loading-spinner loading-lg text-om-green"></div>
        </div>
      </CorporateLayout>
    );
  }

  if (error) {
    return (
      <CorporateLayout
        heroTitle="Client Management"
        heroSubtitle="Error"
        pageType="advisor"
      >
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="alert alert-error">{error}</div>
        </div>
      </CorporateLayout>
    );
  }

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
              <div className="text-sm text-om-grey">Avg Engagement</div>
              <div className="text-3xl font-bold text-om-navy">
                {filteredClients.length > 0
                  ? Math.round(
                      filteredClients.reduce((sum, c) => sum + c.engagementScore, 0) /
                        filteredClients.length,
                    )
                  : 0}
                %
              </div>
            </div>
          </div>
          <div className="card-om bg-om-gold/10">
            <div className="card-body">
              <div className="text-sm text-om-grey">Total LTV</div>
              <div className="text-3xl font-bold text-om-gold">
                N$
                {Math.round(
                  filteredClients.reduce((sum, c) => sum + c.lifetimeValue, 0) / 1000,
                ).toLocaleString()}
                K
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
                    <div className="text-xs text-om-grey">{client.customerNumber}</div>
                  </div>
                  <div className="badge badge-om-active">
                    Active
                  </div>
                </div>

                {/* Client Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <div className="text-xs text-om-grey">Engagement</div>
                    <div className="text-lg font-bold text-om-navy">
                      {Math.round(client.engagementScore)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-om-grey">Lifetime Value</div>
                    <div className="text-lg font-bold text-om-green">
                      N${Math.round(client.lifetimeValue / 1000)}K
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
                    <span className="text-om-grey w-24">Engagement:</span>
                    <span>{Math.round(client.engagementScore)}/100</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <Link href={`/advisor/client/${client.customerNumber}`} className="flex-1">
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
                  {getInitials(selectedClient.name)}
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-om-navy">
                  {selectedClient.name}
                </h4>
                <p className="text-om-grey">{selectedClient.customerNumber}</p>
                <div className="flex gap-2 mt-2">
                  <span className="badge">{selectedClient.segment}</span>
                  <span className="badge">Engagement: {Math.round(selectedClient.engagementScore)}%</span>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="card-om bg-om-green/10">
                <div className="card-body p-4">
                  <div className="text-sm text-om-grey">Lifetime Value</div>
                  <div className="text-2xl font-bold text-om-green">
                    N${Math.round(selectedClient.lifetimeValue).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="card-om bg-om-navy/10">
                <div className="card-body p-4">
                  <div className="text-sm text-om-grey">Engagement Score</div>
                  <div className="text-2xl font-bold text-om-navy">
                    {Math.round(selectedClient.engagementScore)}%
                  </div>
                </div>
              </div>
              <div className="card-om bg-om-gold/10">
                <div className="card-body p-4">
                  <div className="text-sm text-om-grey">Segment</div>
                  <div className="text-2xl font-bold text-om-gold">
                    {selectedClient.segment}
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
              <Link href={`/advisor/client/${selectedClient.customerNumber}`} className="btn btn-om-primary">
                View Full Profile
              </Link>
              <button className="btn btn-om-outline">Send Message</button>
              <button className="btn btn-ghost">Add Note</button>
            </div>
          </div>
        </div>
      )}
    </CorporateLayout>
  );
}
