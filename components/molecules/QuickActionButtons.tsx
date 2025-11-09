/**
 * Quick Action Buttons Component
 * Location: /components/molecules/QuickActionButtons.tsx
 * Purpose: Quick action buttons per PRD requirements
 * PRD: "Request Adviser Consultation", "Download Document", "Raise Claim", "Schedule Review", "Chat with LifeCompass"
 */

"use client";

import { ReactNode } from "react";
import { OMButton } from "@/components/atoms/brand";
import Link from "next/link";

interface QuickAction {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
}

interface QuickActionButtonsProps {
  actions: QuickAction[];
  className?: string;
  layout?: "horizontal" | "vertical" | "grid";
}

export function QuickActionButtons({
  actions,
  className = "",
  layout = "horizontal",
}: QuickActionButtonsProps) {
  const layoutClasses = {
    horizontal: "flex flex-wrap gap-3",
    vertical: "flex flex-col gap-3",
    grid: "grid grid-cols-2 md:grid-cols-3 gap-3",
  };

  return (
    <div className={`${layoutClasses[layout]} ${className}`}>
      {actions.map((action, idx) => {
        const button = (
          <OMButton
            key={idx}
            variant={action.variant || "outline"}
            size="md"
            onClick={action.onClick}
            className="rounded-full"
          >
            {action.icon && <span className="mr-2">{action.icon}</span>}
            {action.label}
          </OMButton>
        );

        if (action.href) {
          return (
            <Link key={idx} href={action.href}>
              {button}
            </Link>
          );
        }

        return button;
      })}
    </div>
  );
}
