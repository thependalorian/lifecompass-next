// app/claims/[id]/page.tsx
// View Claim Details - Customer Self-Service Flow

"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CorporateLayout } from "@/components/templates/CorporateLayout";
import { motion } from "framer-motion";
import {
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon,
  DocumentArrowUpIcon,
} from "@/components/atoms/icons";
import { OMButton } from "@/components/atoms/brand";

// Mock claim data - in production, fetch from API using [id]
const claimData = {
  id: "CLM001",
  type: "Vehicle Accident",
  status: "Under Review",
  date: "2024-10-15",
  amount: "N$15,000",
  description: "Minor vehicle damage from parking incident",
  incidentDate: "2024-10-14",
  incidentLocation: "Katutura Shopping Centre, Windhoek",
  policyNumber: "POL-2024-001",
  documents: [
    {
      id: "DOC001",
      name: "Police Report.pdf",
      uploaded: "2024-10-15",
      status: "Approved",
    },
    {
      id: "DOC002",
      name: "Repair Quote.pdf",
      uploaded: "2024-10-16",
      status: "Pending Review",
    },
    {
      id: "DOC003",
      name: "Damage Photos.zip",
      uploaded: "2024-10-15",
      status: "Approved",
    },
  ],
  timeline: [
    { date: "2024-10-15", event: "Claim submitted", status: "completed" },
    {
      date: "2024-10-16",
      event: "Initial review completed",
      status: "completed",
    },
    {
      date: "2024-10-17",
      event: "Awaiting additional documentation",
      status: "pending",
    },
    { date: "2024-10-20", event: "Expected completion", status: "upcoming" },
  ],
};

export default function ClaimDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const claimId = params.id as string;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Under Review":
        return "badge-om-pending";
      case "Approved":
        return "badge-om-active";
      case "Rejected":
        return "badge-om-inactive";
      default:
        return "badge-om-pending";
    }
  };

  return (
    <CorporateLayout
      heroTitle="Claim Details"
      heroSubtitle={`Claim #${claimId}`}
      pageType="customer"
      showBreadcrumbs={true}
      breadcrumbItems={[
        { label: "Customer", href: "/customer/select" },
        { label: "Claims", href: "/claims" },
        { label: `Claim #${claimId}`, href: `/claims/${claimId}` },
      ]}
    >
      {/* Claim Summary */}
      <section className="py-8 bg-om-light-grey">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="card-om p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-om-navy mb-2 text-om-heading">
                    {claimData.type}
                  </h2>
                  <div className={`badge ${getStatusBadge(claimData.status)}`}>
                    {claimData.status}
                  </div>
                </div>
                <Link href={`/claims/${claimId}/upload`}>
                  <OMButton variant="outline" size="sm">
                    <DocumentArrowUpIcon className="w-4 h-4 mr-2" />
                    Upload Documents
                  </OMButton>
                </Link>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div>
                  <div className="text-sm text-om-grey mb-1">Claim Number</div>
                  <div className="font-semibold text-om-navy text-om-body">
                    {claimData.id}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-om-grey mb-1">Date Filed</div>
                  <div className="font-semibold text-om-navy text-om-body">
                    {claimData.date}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-om-grey mb-1">Claim Amount</div>
                  <div className="font-semibold text-om-navy text-om-body">
                    {claimData.amount}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="text-sm text-om-grey mb-1">Policy Number</div>
                <div className="font-semibold text-om-navy text-om-body">
                  {claimData.policyNumber}
                </div>
              </div>

              <div>
                <div className="text-sm text-om-grey mb-2">Description</div>
                <p className="text-om-body">{claimData.description}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Claim Timeline */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-om-navy mb-6 text-om-heading">
              Claim Timeline
            </h2>
            <div className="card-om p-6">
              <div className="space-y-6">
                {claimData.timeline.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      {item.status === "completed" ? (
                        <CheckCircleIcon className="w-6 h-6 text-om-heritage-green" />
                      ) : item.status === "pending" ? (
                        <ClockIcon className="w-6 h-6 text-om-naartjie" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-om-grey-15" />
                      )}
                      {idx < claimData.timeline.length - 1 && (
                        <div className="w-0.5 h-12 bg-om-grey-15 mt-2" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-om-navy text-om-body">
                        {item.event}
                      </div>
                      <div className="text-sm text-om-grey text-om-body">
                        {item.date}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Documents */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-om-navy mb-6 text-om-heading">
              Submitted Documents
            </h2>
            <div className="card-om p-6">
              <div className="space-y-4">
                {claimData.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 bg-om-grey-5 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <DocumentTextIcon className="w-8 h-8 text-om-heritage-green" />
                      <div>
                        <div className="font-semibold text-om-navy text-om-body">
                          {doc.name}
                        </div>
                        <div className="text-sm text-om-grey text-om-body">
                          Uploaded: {doc.uploaded}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div
                        className={`badge ${
                          doc.status === "Approved"
                            ? "badge-om-active"
                            : "badge-om-pending"
                        }`}
                      >
                        {doc.status}
                      </div>
                      <button className="btn btn-ghost btn-sm">Download</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Actions */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="card-om p-6">
              <h3 className="text-lg font-bold text-om-navy mb-4 text-om-heading">
                Need Help?
              </h3>
              <div className="flex flex-wrap gap-4">
                <Link href={`/claims/${claimId}/upload`}>
                  <OMButton variant="outline">
                    Upload Additional Documents
                  </OMButton>
                </Link>
                <Link href="/chat">
                  <OMButton variant="outline">Chat with AI Assistant</OMButton>
                </Link>
                <a
                  href="tel:+26461223189"
                  className="btn btn-ghost hover:bg-om-heritage-green hover:text-white"
                >
                  Contact Claims Team
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </CorporateLayout>
  );
}
