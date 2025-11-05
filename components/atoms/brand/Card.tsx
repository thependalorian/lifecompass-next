/**
 * OMCard - Old Mutual Brand Card Component (Atom)
 *
 * Brand-aligned card component following Old Mutual Corporate guidelines.
 * White background, subtle borders, consistent spacing per brand config.
 *
 * Location: /components/atoms/brand/Card.tsx
 * Max lines: 100
 */

import { HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface OMCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  variant?: "default" | "elevated";
}

export function OMCard({
  children,
  hover = false,
  padding = "md",
  variant = "default",
  className,
  ...props
}: OMCardProps) {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const variantClasses = {
    default: "card",
    elevated: "card shadow-lg",
  };

  return (
    <div
      className={clsx(
        variantClasses[variant],
        paddingClasses[padding],
        hover && "hover:shadow-xl transition-shadow duration-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function OMCardTitle({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={clsx("card-title font-bold text-base-content", className)}
      style={{ fontFamily: "Montserrat, Century Gothic, system-ui, sans-serif" }}
      {...props}
    >
      {children}
    </h3>
  );
}

export function OMCardBody({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("card-body", className)} {...props}>
      {children}
    </div>
  );
}

export function OMCardActions({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("card-actions mt-4", className)} {...props}>
      {children}
    </div>
  );
}

