// app/claims/new/page.tsx
// Start New Claim - Customer Self-Service Flow

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CorporateLayout } from "@/components/templates/CorporateLayout";
import { motion } from "framer-motion";
import {
  TruckIcon,
  HomeIcon,
  HeartIcon,
  ShieldCheckIcon,
  DocumentArrowUpIcon,
  CheckCircleIcon,
} from "@/components/atoms/icons";
import { OMButton } from "@/components/atoms/brand";

const claimTypes = [
  {
    id: "vehicle",
    title: "Vehicle Claim",
    description: "Accidents, theft, or damage to your vehicle",
    Icon: TruckIcon,
    requiredDocs: ["Police report", "Repair quotes", "Photos of damage"],
  },
  {
    id: "property",
    title: "Property Claim",
    description: "Home damage, theft, or natural disasters",
    Icon: HomeIcon,
    requiredDocs: ["Photos of damage", "Police report", "Repair estimates"],
  },
  {
    id: "funeral",
    title: "Funeral Claim",
    description: "Funeral expenses and related costs",
    Icon: HeartIcon,
    requiredDocs: [
      "Death certificate",
      "Funeral invoices",
      "Beneficiary details",
    ],
  },
  {
    id: "life",
    title: "Life Insurance Claim",
    description: "Life insurance policy payouts",
    Icon: ShieldCheckIcon,
    requiredDocs: [
      "Death certificate",
      "Policy documents",
      "Beneficiary information",
    ],
  },
];

const steps = [
  {
    id: 1,
    title: "Select Claim Type",
    description: "Choose the type of claim you want to file",
  },
  {
    id: 2,
    title: "Provide Details",
    description: "Enter claim information and description",
  },
  {
    id: 3,
    title: "Upload Documents",
    description: "Attach required supporting documents",
  },
  {
    id: 4,
    title: "Review & Submit",
    description: "Review your claim and submit for processing",
  },
];

export default function NewClaimPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedClaimType, setSelectedClaimType] = useState<string | null>(
    null,
  );
  const [claimDetails, setClaimDetails] = useState({
    incidentDate: "",
    incidentLocation: "",
    description: "",
    estimatedAmount: "",
  });
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit claim
      router.push("/claims?submitted=true");
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.push("/claims");
    }
  };

  const selectedType = claimTypes.find((t) => t.id === selectedClaimType);

  return (
    <CorporateLayout
      heroTitle="Start New Claim"
      heroSubtitle="We're here to help you through the claims process"
      pageType="customer"
      showBreadcrumbs={true}
      breadcrumbItems={[
        { label: "Customer", href: "/customer/select" },
        { label: "Claims", href: "/claims" },
        { label: "New Claim", href: "/claims/new" },
      ]}
    >
      {/* Progress Steps */}
      <section className="py-8 bg-om-light-grey">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              {steps.map((step, idx) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        currentStep >= step.id
                          ? "bg-om-heritage-green text-white"
                          : "bg-om-grey-15 text-om-grey"
                      }`}
                    >
                      {currentStep > step.id ? (
                        <CheckCircleIcon className="w-6 h-6" />
                      ) : (
                        step.id
                      )}
                    </div>
                    <div className="mt-2 text-center max-w-[120px]">
                      <div className="text-xs font-semibold text-om-navy">
                        {step.title}
                      </div>
                      <div className="text-xs text-om-grey mt-1">
                        {step.description}
                      </div>
                    </div>
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        currentStep > step.id
                          ? "bg-om-heritage-green"
                          : "bg-om-grey-15"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Step Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Step 1: Select Claim Type */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-om p-8"
              >
                <h2 className="text-2xl font-bold text-om-navy mb-6 text-om-heading">
                  What type of claim would you like to file?
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {claimTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedClaimType(type.id)}
                      className={`card-om p-6 text-left transition-all ${
                        selectedClaimType === type.id
                          ? "ring-2 ring-om-heritage-green bg-om-heritage-green/5"
                          : "hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-om-heritage-green/10 flex items-center justify-center flex-shrink-0">
                          {type.Icon && (
                            <type.Icon className="w-6 h-6 text-om-heritage-green" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-om-navy mb-2 text-om-heading">
                            {type.title}
                          </h3>
                          <p className="text-sm text-om-grey text-om-body">
                            {type.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Provide Details */}
            {currentStep === 2 && selectedType && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-om p-8"
              >
                <h2 className="text-2xl font-bold text-om-navy mb-6 text-om-heading">
                  Tell us about your claim
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold text-om-navy">
                        Incident Date
                      </span>
                    </label>
                    <input
                      type="date"
                      className="input input-bordered w-full input-om"
                      value={claimDetails.incidentDate}
                      onChange={(e) =>
                        setClaimDetails({
                          ...claimDetails,
                          incidentDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold text-om-navy">
                        Incident Location
                      </span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full input-om"
                      placeholder="Where did the incident occur?"
                      value={claimDetails.incidentLocation}
                      onChange={(e) =>
                        setClaimDetails({
                          ...claimDetails,
                          incidentLocation: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold text-om-navy">
                        Description of Incident
                      </span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered w-full input-om"
                      rows={5}
                      placeholder="Please provide a detailed description of what happened..."
                      value={claimDetails.description}
                      onChange={(e) =>
                        setClaimDetails({
                          ...claimDetails,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text font-semibold text-om-navy">
                        Estimated Claim Amount (N$)
                      </span>
                    </label>
                    <input
                      type="number"
                      className="input input-bordered w-full input-om"
                      placeholder="0.00"
                      value={claimDetails.estimatedAmount}
                      onChange={(e) =>
                        setClaimDetails({
                          ...claimDetails,
                          estimatedAmount: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Upload Documents */}
            {currentStep === 3 && selectedType && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-om p-8"
              >
                <h2 className="text-2xl font-bold text-om-navy mb-6 text-om-heading">
                  Upload Required Documents
                </h2>
                <div className="mb-6">
                  <h3 className="font-semibold text-om-navy mb-3">
                    Required Documents:
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-om-body">
                    {selectedType.requiredDocs.map((doc, idx) => (
                      <li key={idx} className="text-om-grey">
                        {doc}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border-2 border-dashed border-om-grey-15 rounded-lg p-12 text-center">
                  <DocumentArrowUpIcon className="w-12 h-12 text-om-grey mx-auto mb-4" />
                  <p className="text-om-grey mb-4 text-om-body">
                    Drag and drop files here, or click to browse
                  </p>
                  <OMButton variant="outline" size="sm">
                    Choose Files
                  </OMButton>
                </div>
                {uploadedDocs.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-om-navy mb-3">
                      Uploaded Documents:
                    </h4>
                    <div className="space-y-2">
                      {uploadedDocs.map((doc, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-om-grey-5 rounded-lg"
                        >
                          <span className="text-om-body">{doc}</span>
                          <button className="btn btn-ghost btn-xs">
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 4: Review & Submit */}
            {currentStep === 4 && selectedType && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-om p-8"
              >
                <h2 className="text-2xl font-bold text-om-navy mb-6 text-om-heading">
                  Review Your Claim
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-om-navy mb-2">
                      Claim Type:
                    </h3>
                    <p className="text-om-body">{selectedType.title}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-om-navy mb-2">
                      Incident Date:
                    </h3>
                    <p className="text-om-body">
                      {claimDetails.incidentDate || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-om-navy mb-2">
                      Location:
                    </h3>
                    <p className="text-om-body">
                      {claimDetails.incidentLocation || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-om-navy mb-2">
                      Description:
                    </h3>
                    <p className="text-om-body">
                      {claimDetails.description || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-om-navy mb-2">
                      Estimated Amount:
                    </h3>
                    <p className="text-om-body">
                      {claimDetails.estimatedAmount
                        ? `N$${claimDetails.estimatedAmount}`
                        : "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="mt-8 p-4 bg-om-sky/10 border border-om-sky/20 rounded-lg">
                  <p className="text-sm text-om-body">
                    By submitting this claim, you confirm that all information
                    provided is accurate and truthful. Our claims team will
                    review your submission and contact you within 2-3 business
                    days.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <OMButton variant="outline" onClick={handleBack}>
                {currentStep === 1 ? "Cancel" : "Back"}
              </OMButton>
              <OMButton
                variant="primary"
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !selectedClaimType) ||
                  (currentStep === 2 &&
                    (!claimDetails.incidentDate ||
                      !claimDetails.description)) ||
                  (currentStep === 3 && uploadedDocs.length === 0)
                }
              >
                {currentStep === 4 ? "Submit Claim" : "Next"}
              </OMButton>
            </div>
          </div>
        </div>
      </section>
    </CorporateLayout>
  );
}
