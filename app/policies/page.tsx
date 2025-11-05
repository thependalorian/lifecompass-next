// app/policies/page.tsx

"use client";

import Link from "next/link";
import { CorporateLayout } from "@/components/templates/CorporateLayout";
import { PolicySummaryTile } from "@/components/molecules/PolicySummaryTile";
import { QuickActionButtons } from "@/components/molecules/QuickActionButtons";
import { motion } from "framer-motion";
import {
  ClipboardDocumentListIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  DocumentTextIcon,
} from "@/components/atoms/icons";

export default function PoliciesPage() {
  // Real policy data from consolidated documents
  const policies = [
    {
      id: "OMP-SIC-001",
      name: "Policyholder",
      type: "OMP Severe Illness Cover",
      status: "Active",
      coverage: "N$5,000,000",
      premium: "N$2,500/month",
      renewalDate: "2025-12-01",
      advisor: "Old Mutual Advisor",
      description: "Coverage for 68 severe illnesses with lump sum benefits",
    },
    {
      id: "OMP-FIC-002",
      name: "Policyholder",
      type: "OMP Funeral Insurance",
      status: "Active",
      coverage: "N$50,000",
      premium: "N$350/month",
      renewalDate: "2025-11-15",
      advisor: "Old Mutual Advisor",
      description: "Extended family funeral coverage with cashback benefits",
    },
    {
      id: "OMP-DIC-003",
      name: "Policyholder",
      type: "OMP Disability Income Cover",
      status: "Active",
      coverage: "75% of income",
      premium: "N$1,200/month",
      renewalDate: "2025-10-30",
      advisor: "Old Mutual Advisor",
      description: "Monthly income replacement for disability up to age 65",
    },
    {
      id: "UT-INCOME-004",
      name: "Investor",
      type: "Old Mutual Namibia Income Fund",
      status: "Active",
      coverage: "Unit Trust Investment",
      premium: "N$1,000/month",
      renewalDate: "Ongoing",
      advisor: "Old Mutual Investment Group",
      description: "Professional investment in income-generating assets",
    },
    {
      id: "UT-GROWTH-005",
      name: "Investor",
      type: "Old Mutual Namibia Growth Fund",
      status: "Active",
      coverage: "Unit Trust Investment",
      premium: "N$500/month",
      renewalDate: "Ongoing",
      advisor: "Old Mutual Investment Group",
      description: "Growth-oriented investment in Namibian equities",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return "badge-om-active";
      case "Pending":
        return "badge-om-pending";
      default:
        return "badge-om-inactive";
    }
  };

  const quickActions = [
    {
      label: "Chat with LifeCompass",
      href: "/chat",
      variant: "primary" as const,
    },
    {
      label: "Request Advisor Consultation",
      href: "/advisors",
      variant: "outline" as const,
    },
    {
      label: "Download Documents",
      onClick: () => console.log("Download documents"),
      variant: "ghost" as const,
    },
  ];

  return (
    <CorporateLayout
      heroTitle="My Policies"
      heroSubtitle="Manage and track all your Old Mutual policies"
      heroBackground="/id3Zh06DHT_1762296722528.jpeg"
      pageType="customer"
    >
      {/* Quick Stats */}
      <section className="py-8 bg-om-grey-5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "Active Policies",
                value: "5",
                Icon: ClipboardDocumentListIcon,
              },
              { label: "Total Coverage", value: "N$5.3M+", Icon: ShieldCheckIcon },
              { label: "Monthly Premium", value: "N$5,550", Icon: BanknotesIcon },
              { label: "Claims Processed", value: "12", Icon: DocumentTextIcon },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className="card-om p-4 text-center"
              >
                <div className="mb-2 flex justify-center">
                  <stat.Icon className="w-8 h-8 text-om-heritage-green" />
                </div>
                <div className="text-2xl font-bold text-om-navy">
                  {stat.value}
                </div>
                <div className="text-sm text-om-grey">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Policies List */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-om-navy">Your Policies</h2>
            <Link href="/products" className="btn-om-primary">
              Add New Policy
            </Link>
          </div>

          <div className="grid gap-6">
            {policies.map((policy, idx) => (
              <motion.div
                key={policy.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="card-om p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <h3 className="text-xl font-bold text-om-navy">
                        {policy.type}
                      </h3>
                      <div className={`badge ${getStatusBadge(policy.status)}`}>
                        {policy.status}
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-om-grey">{policy.description}</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-om-grey">Policy Number:</span>
                        <div className="font-semibold text-om-navy">
                          {policy.id}
                        </div>
                      </div>
                      <div>
                        <span className="text-om-grey">Coverage:</span>
                        <div className="font-semibold text-om-navy">
                          {policy.coverage}
                        </div>
                      </div>
                      <div>
                        <span className="text-om-grey">Premium:</span>
                        <div className="font-semibold text-om-navy">
                          {policy.premium}
                        </div>
                      </div>
                      <div>
                        <span className="text-om-grey">Renewal Date:</span>
                        <div className="font-semibold text-om-navy">
                          {policy.renewalDate}
                        </div>
                      </div>
                      <div>
                        <span className="text-om-grey">Advisor:</span>
                        <div className="font-semibold text-om-navy">
                          {policy.advisor}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 lg:mt-0 lg:flex-col lg:gap-2">
                    <button className="btn-om-primary btn-sm">
                      View Details
                    </button>
                    <button className="btn-om-outline btn-sm">Download</button>
                    <button className="btn btn-ghost btn-sm">
                      Contact Advisor
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="py-12 bg-om-light-grey">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-om-navy mb-8">
            Recent Activity
          </h2>

          <div className="card-om p-6">
            <div className="space-y-4">
              {[
                {
                  action: "OMP Severe Illness Cover policy updated",
                  policy: "OMP Severe Illness Cover",
                  date: "2025-11-04",
                  status: "success",
                  details: "Coverage expanded to include additional severe illnesses"
                },
                {
                  action: "Unit trust contribution processed",
                  policy: "Old Mutual Namibia Income Fund",
                  date: "2025-11-03",
                  status: "success",
                  details: "Monthly contribution of N$1,000 successfully invested"
                },
                {
                  action: "Funeral insurance premium payment",
                  policy: "OMP Funeral Insurance",
                  date: "2025-11-01",
                  status: "success",
                  details: "Monthly premium of N$350 processed successfully"
                },
                {
                  action: "Policy document downloaded",
                  policy: "OMP Disability Income Cover",
                  date: "2025-10-30",
                  status: "info",
                  details: "Complete policy documentation accessed"
                },
                {
                  action: "Investment portfolio review",
                  policy: "Old Mutual Namibia Growth Fund",
                  date: "2025-10-28",
                  status: "info",
                  details: "Quarterly performance review completed"
                },
              ].map((activity, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-3 border-b border-base-200 last:border-b-0"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        activity.status === "success"
                          ? "bg-om-green"
                          : "bg-om-gold"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-om-navy">
                        {activity.action}
                      </p>
                      <p className="text-sm text-om-grey">{activity.policy}</p>
                      <p className="text-xs text-om-grey/70 mt-1">{activity.details}</p>
                    </div>
                  </div>
                  <div className="text-sm text-om-grey text-right">
                    {activity.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="bg-om-grey-5 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-om-navy mb-6 text-center">
              Need Help with Your Policies?
            </h2>
            <QuickActionButtons actions={quickActions} layout="horizontal" className="justify-center" />
          </div>
        </div>
      </section>
    </CorporateLayout>
  );
}

