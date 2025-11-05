/**
 * Problem Card Component
 * Location: /components/molecules/ProblemCard.tsx
 * Purpose: Custom card layout for problem statements
 */

"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface ProblemCardProps {
  icon: ReactNode;
  iconBg?: string;
  gradientFrom?: string;
  gradientTo?: string;
  children: ReactNode;
  delay?: number;
}

export function ProblemCard({
  icon,
  iconBg = "bg-om-heritage-green/10",
  gradientFrom = "from-om-heritage-green/20",
  gradientTo = "to-om-fresh-green/20",
  children,
  delay = 0,
}: ProblemCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="relative group"
    >
      <div
        className={`absolute -inset-1 bg-gradient-to-r ${gradientFrom} ${gradientTo} rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />
      <div className="relative bg-white p-8 rounded-2xl border border-om-grey-15 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-start gap-4">
          <div
            className={`w-14 h-14 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0`}
          >
            {icon}
          </div>
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </motion.div>
  );
}

