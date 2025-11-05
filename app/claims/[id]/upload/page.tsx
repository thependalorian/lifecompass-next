// app/claims/[id]/upload/page.tsx
// Upload Documents for Claim - Customer Self-Service Flow

"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { CorporateLayout } from "@/components/templates/CorporateLayout";
import { motion } from "framer-motion";
import {
  DocumentArrowUpIcon,
  DocumentTextIcon,
  XMarkIcon,
  CheckCircleIcon,
} from "@/components/atoms/icons";
import { OMButton } from "@/components/atoms/brand";

// Mock claim data - in production, fetch from API using [id]
const claimData = {
  id: "CLM001",
  type: "Vehicle Accident",
  status: "Under Review",
  requiredDocuments: [
    { id: "POLICE_REPORT", name: "Police Report", required: true, uploaded: false },
    { id: "REPAIR_QUOTE", name: "Repair Quote", required: true, uploaded: true },
    { id: "DAMAGE_PHOTOS", name: "Damage Photos", required: true, uploaded: true },
    { id: "VEHICLE_REG", name: "Vehicle Registration", required: false, uploaded: false },
  ],
};

export default function UploadDocumentsPage() {
  const params = useParams();
  const router = useRouter();
  const claimId = params.id as string;
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ id: string; name: string; file: File }>
  >([]);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFiles([
        ...uploadedFiles,
        {
          id: Date.now().toString(),
          name: file.name,
          file: file,
        },
      ]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFiles([
        ...uploadedFiles,
        {
          id: Date.now().toString(),
          name: file.name,
          file: file,
        },
      ]);
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles(uploadedFiles.filter((f) => f.id !== id));
  };

  const handleSubmit = () => {
    // In production, upload files to server
    router.push(`/claims/${claimId}?uploaded=true`);
  };

  return (
    <CorporateLayout
      heroTitle="Upload Documents"
      heroSubtitle={`Add supporting documents for Claim #${claimId}`}
      pageType="customer"
    >
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Required Documents List */}
            <div className="card-om p-6 mb-8">
              <h2 className="text-2xl font-bold text-om-navy mb-6 text-om-heading">
                Required Documents
              </h2>
              <div className="space-y-4">
                {claimData.requiredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 bg-om-grey-5 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      {doc.uploaded ? (
                        <CheckCircleIcon className="w-6 h-6 text-om-heritage-green" />
                      ) : (
                        <DocumentTextIcon className="w-6 h-6 text-om-grey" />
                      )}
                      <div>
                        <div className="font-semibold text-om-navy text-om-body">{doc.name}</div>
                        {doc.required && (
                          <div className="text-xs text-om-naartjie">Required</div>
                        )}
                      </div>
                    </div>
                    {doc.uploaded && (
                      <div className="badge badge-om-active">Uploaded</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Upload Area */}
            <div className="card-om p-8 mb-8">
              <h2 className="text-2xl font-bold text-om-navy mb-6 text-om-heading">
                Upload Files
              </h2>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
                  dragActive
                    ? "border-om-heritage-green bg-om-heritage-green/5"
                    : "border-om-grey-15"
                }`}
              >
                <DocumentArrowUpIcon
                  className={`w-16 h-16 mx-auto mb-4 ${
                    dragActive ? "text-om-heritage-green" : "text-om-grey"
                  }`}
                />
                <p className="text-lg font-semibold text-om-navy mb-2 text-om-heading">
                  Drag and drop files here
                </p>
                <p className="text-om-grey mb-6 text-om-body">
                  or click the button below to browse files
                </p>
                <label className="btn btn-om-primary cursor-pointer">
                  Choose Files
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    onChange={handleFileInput}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
                </label>
                <p className="text-xs text-om-grey mt-4 text-om-body">
                  Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB per file)
                </p>
              </div>
            </div>

            {/* Uploaded Files Preview */}
            {uploadedFiles.length > 0 && (
              <div className="card-om p-6 mb-8">
                <h3 className="text-lg font-bold text-om-navy mb-4 text-om-heading">
                  Files Ready to Upload
                </h3>
                <div className="space-y-3">
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-4 bg-om-grey-5 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <DocumentTextIcon className="w-6 h-6 text-om-heritage-green" />
                        <div>
                          <div className="font-semibold text-om-navy text-om-body">{file.name}</div>
                          <div className="text-xs text-om-grey text-om-body">
                            {(file.file.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(file.id)}
                        className="btn btn-ghost btn-sm text-error"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between">
              <Link href={`/claims/${claimId}`}>
                <OMButton variant="outline">Cancel</OMButton>
              </Link>
              <OMButton
                variant="primary"
                onClick={handleSubmit}
                disabled={uploadedFiles.length === 0}
              >
                Upload Documents
              </OMButton>
            </div>
          </div>
        </div>
      </section>
    </CorporateLayout>
  );
}

