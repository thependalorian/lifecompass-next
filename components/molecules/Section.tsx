/**
 * Custom Section Component
 * Location: /components/molecules/Section.tsx
 * Purpose: Reusable section layout with custom styling
 */

"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface SectionProps {
  children: ReactNode;
  className?: string;
  background?: "white" | "grey" | "gradient" | "custom";
  customBackground?: string;
  pattern?: boolean;
  id?: string;
}

export function Section({
  children,
  className = "",
  background = "white",
  customBackground,
  pattern = false,
  id,
}: SectionProps) {
  const bgClasses = {
    white: "bg-white",
    grey: "bg-om-grey-5",
    gradient: "bg-gradient-to-b from-om-grey-5 to-white",
    custom: customBackground || "",
  };

  return (
    <section
      id={id}
      className={`relative py-24 overflow-hidden ${bgClasses[background]} ${className}`}
    >
      {pattern && (
        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(circle_at_50%_50%,_#009677_2px,_transparent_2px)] bg-[length:40px_40px]" />
      )}
      <div className="container mx-auto px-4 relative z-10">
        {children}
      </div>
    </section>
  );
}

interface SectionHeaderProps {
  badge?: string;
  title: string;
  subtitle?: string;
  className?: string;
}

export function SectionHeader({
  badge,
  title,
  subtitle,
  className = "",
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`text-center mb-12 ${className}`}
    >
      {badge && (
        <span className="inline-block px-4 py-1.5 rounded-full bg-om-cerise/10 text-om-cerise font-semibold text-sm mb-4">
          {badge}
        </span>
      )}
      <h2 className="text-4xl md:text-5xl font-bold text-om-navy mb-6">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg md:text-xl text-om-grey-80 max-w-3xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}

