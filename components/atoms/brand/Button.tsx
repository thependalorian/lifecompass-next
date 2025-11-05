/**
 * OMButton - Old Mutual Brand Button Component (Atom)
 *
 * Brand-aligned button component following Old Mutual Corporate guidelines.
 * Uses DaisyUI button classes with official OM color palette.
 *
 * Location: /components/atoms/brand/Button.tsx
 * Max lines: 100
 */

import { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface OMButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  children: ReactNode;
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
}

export function OMButton({
  variant = "primary",
  size = "md",
  children,
  fullWidth = false,
  icon,
  iconPosition = "left",
  className,
  disabled,
  ...props
}: OMButtonProps) {
  const baseClasses = "btn font-semibold transition-all duration-300";

  const variantClasses = {
    primary: "btn-om-primary", // Heritage Green (#009677) - Main CTAs per brand guide
    secondary: "btn-om-secondary", // Transparent with Heritage Green border
    outline: "btn-om-outline", // Heritage Green outline
    ghost: "btn-om-tertiary", // Text-only with underline on hover
    danger: "btn-om-danger", // Cerise (#ed0080) for destructive actions
  };

  const sizeClasses = {
    xs: "btn-xs",
    sm: "btn-sm",
    md: "btn-md",
    lg: "btn-lg",
    xl: "h-14 px-8 text-xl",
  };

  return (
    <button
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        disabled && "btn-disabled",
        "flex items-center justify-center gap-2 text-center",
        className
      )}
      disabled={disabled}
      {...props}
    >
      {icon && iconPosition === "left" && icon}
      <span>{children}</span>
      {icon && iconPosition === "right" && icon}
    </button>
  );
}

