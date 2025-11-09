/**
 * OMBadge - Old Mutual Brand Badge Component (Atom)
 *
 * Brand-aligned badge component for status indicators.
 * Uses official Old Mutual Corporate color palette.
 *
 * Location: /components/atoms/brand/Badge.tsx
 * Max lines: 100
 */

import { HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface OMBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?:
    | "active"
    | "pending"
    | "inactive"
    | "success"
    | "warning"
    | "error"
    | "info";
  size?: "xs" | "sm" | "md" | "lg";
}

export function OMBadge({
  children,
  variant = "active",
  size = "md",
  className,
  ...props
}: OMBadgeProps) {
  const variantClasses = {
    active: "badge badge-primary", // Heritage Green
    pending: "badge badge-warning", // Sun/Yellow
    inactive: "badge badge-neutral", // Grey
    success: "badge badge-success", // Fresh Green
    warning: "badge badge-warning", // Sun
    error: "badge badge-error", // Cerise
    info: "badge badge-info", // Sky
  };

  const sizeClasses = {
    xs: "badge-xs",
    sm: "badge-sm",
    md: "",
    lg: "badge-lg",
  };

  return (
    <span
      className={clsx(
        "badge",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
