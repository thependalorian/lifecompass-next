/**
 * Metric Card Component
 * Location: /components/molecules/MetricCard.tsx
 * Purpose: Custom metric display card with gradient
 */

"use client";

import { motion } from "framer-motion";

interface MetricCardProps {
  metric: string;
  label: string;
  description: string;
  gradientFrom?: string;
  gradientTo?: string;
  delay?: number;
}

export function MetricCard({
  metric,
  label,
  description,
  gradientFrom = "from-om-heritage-green",
  gradientTo = "to-om-fresh-green",
  delay = 0,
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="group relative"
    >
      <div
        className={`absolute -inset-0.5 bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
      />
      <div className="relative bg-white p-6 rounded-2xl border border-om-grey-15 shadow-sm hover:shadow-lg transition-all text-center h-full">
        <div
          className={`text-5xl md:text-6xl font-bold bg-gradient-to-br ${gradientFrom} ${gradientTo} bg-clip-text text-transparent mb-3`}
        >
          {metric}
        </div>
        <div className="text-lg font-semibold text-om-navy mb-2">{label}</div>
        <div className="text-sm text-om-grey-60 leading-relaxed">
          {description}
        </div>
      </div>
    </motion.div>
  );
}
