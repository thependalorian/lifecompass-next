/**
 * Customer Profile Card Component
 * Location: /components/molecules/CustomerProfileCard.tsx
 * Purpose: Customer profile display per PRD requirements
 * PRD: Avatar, full name, preferred name, contact info, KYC badge, "Last active" timestamp
 */

"use client";

import { ReactNode } from "react";
import { OMButton } from "@/components/atoms/brand";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

interface CustomerProfileCardProps {
  name: string;
  preferredName?: string;
  email?: string;
  phone?: string;
  kycStatus?: "verified" | "pending" | "expired";
  lastActive?: string;
  avatarUrl?: string;
  quickActions?: Array<{
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  }>;
}

export function CustomerProfileCard({
  name,
  preferredName,
  email,
  phone,
  kycStatus = "verified",
  lastActive,
  avatarUrl,
  quickActions,
}: CustomerProfileCardProps) {
  const kycStatusConfig = {
    verified: {
      color: "bg-om-fresh-green",
      text: "Verified",
      icon: CheckCircleIcon,
    },
    pending: {
      color: "bg-om-sun",
      text: "Pending",
      icon: CheckCircleIcon,
    },
    expired: {
      color: "bg-om-cerise",
      text: "Expired",
      icon: CheckCircleIcon,
    },
  };

  const status = kycStatusConfig[kycStatus];
  const StatusIcon = status.icon;

  return (
    <div className="card-om p-6">
      <div className="flex items-start gap-4 mb-6">
        {/* Avatar */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-om-heritage-green/10 flex items-center justify-center ring-2 ring-om-heritage-green/20">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <UserIcon className="w-8 h-8 text-om-heritage-green" />
            )}
          </div>
          {kycStatus === "verified" && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-om-fresh-green border-2 border-white flex items-center justify-center">
              <StatusIcon className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="flex-1">
          <h3 className="text-xl font-bold text-om-navy mb-1">
            {preferredName || name}
          </h3>
          {preferredName && (
            <p className="text-sm text-om-grey-60 mb-2">{name}</p>
          )}
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`badge-om-${kycStatus === "verified" ? "active" : "pending"} text-xs px-2 py-1`}
            >
              {status.text}
            </span>
            {lastActive && (
              <span className="text-xs text-om-grey-60">
                Last active: {lastActive}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-6">
        {email && (
          <div className="flex items-center gap-2 text-om-grey-80">
            <EnvelopeIcon className="w-4 h-4 text-om-grey-60" />
            <span className="text-sm">{email}</span>
          </div>
        )}
        {phone && (
          <div className="flex items-center gap-2 text-om-grey-80">
            <PhoneIcon className="w-4 h-4 text-om-grey-60" />
            <span className="text-sm">{phone}</span>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {quickActions && quickActions.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-4 border-t border-om-grey-15">
          {quickActions.map((action, idx) => (
            <OMButton
              key={idx}
              variant="outline"
              size="sm"
              onClick={action.onClick}
              className="rounded-full"
            >
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.label}
            </OMButton>
          ))}
        </div>
      )}
    </div>
  );
}

