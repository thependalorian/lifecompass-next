// app/claims/page.tsx

"use client";

import Link from "next/link";
import { CorporateLayout } from "@/components/templates/CorporateLayout";
import { motion } from "framer-motion";
import {
  TruckIcon,
  HomeIcon,
  HeartIcon,
  ShieldCheckIcon,
} from "@/components/atoms/icons";

export default function ClaimsPage() {
  const claims = [
    {
      id: "DTH-2025-001",
      type: "Death Claim - OMP Funeral Insurance",
      status: "Approved",
      date: "2025-10-15",
      amount: "N$50,000",
      description: "Funeral benefit payout for policyholder Maria Shikongo - Final expenses benefit paid within 48 hours",
    },
    {
      id: "DIS-2025-002",
      type: "Disability Income Claim",
      status: "Under Review",
      date: "2025-11-01",
      amount: "N$8,500/month",
      description: "OMP Disability Income Cover - Occupational disability claim for John-Paul !Gaeb, 75% of income replacement",
    },
    {
      id: "MTR-2025-003",
      type: "Motor Theft Claim",
      status: "Processing",
      date: "2025-10-28",
      amount: "N$350,000",
      description: "Toyota Hilux stolen from farm premises - Police report submitted, awaiting salvage recovery assessment",
    },
  ];

  const claimTypes = [
    {
      title: "Death Claims",
      description: "Claims for life insurance and funeral benefits upon death",
      Icon: HeartIcon,
      process: [
        "Report death immediately to Old Mutual Claims Service Centre: 061 223 189",
        "Obtain official death certificate from Ministry of Home Affairs",
        "Complete Old Mutual Death Claim form and Beneficiary Nomination form",
        "Provide certified copies of ID documents for deceased and beneficiaries",
        "Submit bank account proof (not older than 3 months) for each beneficiary",
        "For unnatural deaths: Submit police report and Declaration by Police form",
        "Email documents to Namibia@oldmutual.com or fax to 061 225 261",
        "Final expenses benefits paid within 48 hours, other claims within 15 working days",
      ],
    },
    {
      title: "Disability Claims",
      description: "Claims for disability income and functional impairment benefits",
      Icon: ShieldCheckIcon,
      process: [
        "Report disability to Old Mutual Claims Service Centre: 061 223 189 within 30 days",
        "Complete OMP Disability Income Cover claim form with medical details",
        "Provide treating doctor's report confirming occupational disability",
        "Submit proof of income and employment details",
        "For functional impairment: Include specialist medical assessment",
        "Claims processed within 15 working days of receiving complete documentation",
        "Benefits paid monthly for up to the benefit period (shown in policy details)",
        "Waiting period applies before benefit payments commence",
      ],
    },
    {
      title: "Motor Theft Claims",
      description: "Claims for stolen vehicles and related losses",
      Icon: TruckIcon,
      process: [
        "Report theft to police immediately and obtain police report",
        "Contact Old Mutual within 24 hours: 061 207 7111",
        "Complete Motor Theft Claim Form (L8721) with full vehicle details",
        "Provide registration, VIN/chassis number, and engine number",
        "List all stolen accessories and their values",
        "Submit proof of ownership and outstanding finance (if applicable)",
        "Claims assessed within 30 days, payments made to registered owner",
        "Salvage recovery may affect settlement amount",
      ],
    },
    {
      title: "Property Damage Claims",
      description: "Claims for property damage, theft, or natural disasters",
      Icon: HomeIcon,
      process: [
        "Report incident to police for criminal matters",
        "Secure damaged property to prevent further loss",
        "Contact Old Mutual immediately: 061 207 7111",
        "Document damage with detailed photographs and descriptions",
        "Obtain repair estimates from qualified contractors",
        "Complete Property Claim Form with incident circumstances",
        "Submit proof of ownership and policy details",
        "Claims processed within 30 days of receiving all required documentation",
      ],
    },
    {
      title: "Glass Claims",
      description: "Claims for broken windshields, windows, and glass damage",
      Icon: TruckIcon,
      process: [
        "Report damage to Old Mutual: 061 207 7111",
        "Complete Glass Claim Form with incident details",
        "Provide description of damage and cause of breakage",
        "Submit repair quotes from authorized glass repair services",
        "Claims processed within 5 working days",
        "Repairs arranged through Old Mutual's approved service providers",
        "No excess applies to glass claims in most policies",
      ],
    },
    {
      title: "Maternity Benefit Claims",
      description: "Claims for maternity and newborn benefits",
      Icon: ShieldCheckIcon,
      process: [
        "Notify Old Mutual of pregnancy within first trimester",
        "Complete Maternity Benefit Claim Form upon birth",
        "Submit birth certificate and medical records",
        "Provide proof of hospital admission and treatment costs",
        "Claims processed within 15 working days",
        "Benefits paid directly to hospital or as reimbursement",
        "Pre-authorization may be required for certain procedures",
      ],
    },
  ];

  return (
    <CorporateLayout
      heroTitle="File a Claim"
      heroSubtitle="Get support when you need it most"
      heroBackground="/id3Zh06DHT_1762296722528.jpeg"
      pageType="customer"
    >
      {/* Quick Actions */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card-om p-8"
            >
              <h2 className="text-2xl font-bold text-om-navy mb-4">
                File a New Claim
              </h2>
              <p className="text-om-grey mb-6">
                Start the claims process for your insurance policy. Our AI
                assistant can guide you through the required documentation.
              </p>
              <Link href="/claims/new" className="btn-om-primary btn-lg w-full">
                Start New Claim
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card-om p-8"
            >
              <h2 className="text-2xl font-bold text-om-navy mb-4">
                Claims Assistance
              </h2>
              <p className="text-om-grey mb-6">
                Need help with your claim? Contact our dedicated Claims Service Centre
                for expert assistance with documentation and claim processing.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-om-navy">Claims Service Centre:</span>
                  <span className="text-om-grey">061 223 189</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-om-navy">Short-term Insurance:</span>
                  <span className="text-om-grey">061 207 7111</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-om-navy">Email:</span>
                  <span className="text-om-grey">Namibia@oldmutual.com</span>
                </div>
                <button className="btn-om-outline btn-lg w-full mt-4">
                  Call Claims Service Centre
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Claim Types */}
      <section className="py-12 bg-om-light-grey">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-om-navy mb-8 text-center text-om-heading">
            Types of Claims
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {claimTypes.map((type, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="card-om p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-om-heritage-green/10 flex-shrink-0">
                    {type.Icon && <type.Icon className="w-6 h-6 text-om-heritage-green" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-om-navy mb-2 text-om-heading">
                      {type.title}
                    </h3>
                    <p className="text-om-grey mb-4 text-om-body">{type.description}</p>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-om-navy">Process:</h4>
                      <ol className="list-decimal list-inside text-sm text-om-grey space-y-1 text-om-body">
                        {type.process.map((step, stepIdx) => (
                          <li key={stepIdx}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Claims */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-om-navy mb-8 text-om-heading">Your Claims</h2>

          {claims.length > 0 ? (
            <div className="grid gap-6">
              {claims.map((claim, idx) => (
                <motion.div
                  key={claim.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="card-om p-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <h3 className="text-xl font-bold text-om-navy text-om-heading">
                          {claim.type}
                        </h3>
                        <div className="badge-om-pending">{claim.status}</div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 text-sm text-om-body">
                        <div>
                          <span className="text-om-grey">Claim Number:</span>
                          <div className="font-semibold text-om-navy">
                            {claim.id}
                          </div>
                        </div>
                        <div>
                          <span className="text-om-grey">Date Filed:</span>
                          <div className="font-semibold text-om-navy">
                            {claim.date}
                          </div>
                        </div>
                        <div>
                          <span className="text-om-grey">Claim Amount:</span>
                          <div className="font-semibold text-om-navy">
                            {claim.amount}
                          </div>
                        </div>
                      </div>

                      <p className="text-om-grey mt-3 text-om-body">{claim.description}</p>
                    </div>

                    <div className="flex gap-2 mt-4 lg:mt-0 lg:flex-col lg:gap-2">
                      <Link href={`/claims/${claim.id}`} className="btn-om-primary btn-sm">
                        View Details
                      </Link>
                      <Link href={`/claims/${claim.id}/upload`} className="btn-om-outline btn-sm">
                        Upload Documents
                      </Link>
                      <button className="btn btn-ghost btn-sm">
                        Contact Claims Team
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="card-om p-12 text-center">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-xl font-bold text-om-navy mb-2 text-om-heading">
                No Claims Filed
              </h3>
              <p className="text-om-grey text-om-body">
                You haven't filed any claims yet. We're here when you need us.
              </p>
            </div>
          )}
        </div>
      </section>
    </CorporateLayout>
  );
}
