/**
 * Policy Summary Tile Component
 * Location: /components/molecules/PolicySummaryTile.tsx
 * Purpose: Policy display per PRD requirements
 * PRD: Policy type icon, policy number, status badge, premium amount, next review date
 */

"use client";

import { ReactNode } from "react";
import { OMButton } from "@/components/atoms/brand";
import {
  DocumentTextIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

interface PolicySummaryTileProps {
  policyNumber: string;
  productType: string;
  status: "active" | "lapsed" | "cancelled" | "matured";
  premiumAmount: number;
  premiumFrequency?: "monthly" | "quarterly" | "annually";
  nextReviewDate?: string;
  coverageAmount?: number;
  icon?: ReactNode;
  onViewDetails?: () => void;
  onDownloadStatement?: () => void;
  onRequestChange?: () => void;
}

export function PolicySummaryTile({
  policyNumber,
  productType,
  status,
  premiumAmount,
  premiumFrequency = "monthly",
  nextReviewDate,
  coverageAmount,
  icon,
  onViewDetails,
  onDownloadStatement,
  onRequestChange,
}: PolicySummaryTileProps) {
  const statusConfig = {
    active: {
      color: "bg-om-fresh-green",
      text: "Active",
    },
    lapsed: {
      color: "bg-om-sun",
      text: "Lapsed",
    },
    cancelled: {
      color: "bg-om-cerise",
      text: "Cancelled",
    },
    matured: {
      color: "bg-om-grey-40",
      text: "Matured",
    },
  };

  const statusInfo = statusConfig[status];

  return (
    <div className="card-om p-6 hover:shadow-lg transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon ? (
            <div className="w-10 h-10 text-om-heritage-green">{icon}</div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-om-heritage-green/10 flex items-center justify-center">
              <DocumentTextIcon className="w-6 h-6 text-om-heritage-green" />
            </div>
          )}
          <div>
            <h3 className="font-bold text-om-navy">{productType}</h3>
            <p className="text-xs text-om-grey-60">{policyNumber}</p>
          </div>
        </div>
        <span
          className={`badge-om-${status === "active" ? "active" : "pending"} text-xs px-3 py-1`}
        >
          {statusInfo.text}
        </span>
      </div>

      {/* Financial Info */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-om-grey-60 mb-1">Premium</p>
          <p className="text-lg font-bold text-om-navy">
            N${premiumAmount.toLocaleString()}
          </p>
          <p className="text-xs text-om-grey-60 capitalize">
            {premiumFrequency}
          </p>
        </div>
        {coverageAmount && (
          <div>
            <p className="text-xs text-om-grey-60 mb-1">Coverage</p>
            <p className="text-lg font-bold text-om-heritage-green">
              N${coverageAmount.toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* Next Review Date */}
      {nextReviewDate && (
        <div className="flex items-center gap-2 text-sm text-om-grey-60 mb-4">
          <CalendarIcon className="w-4 h-4" />
          <span>Next review: {nextReviewDate}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-4 border-t border-om-grey-15">
        {onViewDetails && (
          <OMButton
            variant="outline"
            size="sm"
            onClick={onViewDetails}
            className="rounded-full flex-1 min-w-[120px]"
          >
            View Details
          </OMButton>
        )}
        {onDownloadStatement && (
          <OMButton
            variant="ghost"
            size="sm"
            onClick={onDownloadStatement}
            className="rounded-full"
          >
            <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
            Statement
          </OMButton>
        )}
        {onRequestChange && (
          <OMButton
            variant="ghost"
            size="sm"
            onClick={onRequestChange}
            className="rounded-full"
          >
            Request Change
          </OMButton>
        )}
      </div>
    </div>
  );
}
