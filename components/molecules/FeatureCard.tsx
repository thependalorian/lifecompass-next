/**
 * Feature Card Component
 * Location: /components/molecules/FeatureCard.tsx
 * Purpose: Custom feature card with gradient hover effects
 */

"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  iconColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  delay?: number;
}

export function FeatureCard({
  icon,
  title,
  description,
  iconColor = "text-om-heritage-green",
  gradientFrom = "from-om-heritage-green/10",
  gradientTo = "to-om-heritage-green/5",
  delay = 0,
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="group relative"
    >
      <div
        className={`absolute -inset-0.5 bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />
      <div className="relative bg-white p-6 rounded-2xl border border-om-grey-15 shadow-sm hover:shadow-lg transition-all h-full">
        <div className={`flex justify-center ${iconColor} mb-4`}>
          {icon}
        </div>
        <h3 className="text-xl font-bold text-om-navy mb-3">{title}</h3>
        <p className="text-om-grey-60 leading-relaxed text-sm">{description}</p>
      </div>
    </motion.div>
  );
}

