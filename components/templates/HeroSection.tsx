/**
 * Hero Section Template
 * Location: /components/templates/HeroSection.tsx
 * Purpose: Custom hero section layout
 */

"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { OMButton } from "@/components/atoms/brand";

interface HeroSectionProps {
  badge?: {
    icon: ReactNode;
    text: string;
  };
  title: string;
  titleHighlight?: string;
  subtitle?: string;
  description?: string;
  ctaPrimary?: {
    text: string;
    href: string;
  };
  ctaSecondary?: {
    text: string;
    href: string;
  };
  points?: Array<{
    icon: ReactNode;
    text: string;
  }>;
  backgroundImage?: string;
}

export function HeroSection({
  badge,
  title,
  titleHighlight,
  subtitle,
  description,
  ctaPrimary,
  ctaSecondary,
  points,
  backgroundImage = "/id3Zh06DHT_1762296722528.jpeg",
}: HeroSectionProps) {
  return (
    <section className="relative min-h-[600px] sm:min-h-[700px] md:min-h-[850px] flex items-center text-white overflow-hidden py-8 sm:py-0">
      {/* Background Image with Custom Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${backgroundImage}')`,
        }}
      />

      {/* Custom Gradient Overlay - Asymmetric for visual interest */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/60 to-black/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-om-heritage-green/35 via-om-future-green/25 to-transparent mix-blend-soft-light" />

      {/* Content with Custom Layout */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            {/* Hackathon Badge - Custom Styling */}
            {badge && (
              <div className="inline-block mb-8">
                <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-om-naartjie/90 backdrop-blur-sm text-white font-bold text-sm md:text-base shadow-lg border border-white/20">
                  {badge.icon}
                  {badge.text}
                </span>
              </div>
            )}

            {/* Main Headline - Custom Typography */}
            <h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 sm:mb-8 drop-shadow-2xl leading-tight px-2"
              style={{
                fontFamily: "Montserrat, Century Gothic, system-ui, sans-serif",
              }}
            >
              {title}
              {titleHighlight && (
                <span className="block mt-2 sm:mt-3 bg-gradient-to-r from-om-future-green via-om-fresh-green to-om-heritage-green bg-clip-text text-transparent">
                  {titleHighlight}
                </span>
              )}
            </h1>

            {/* Subheadline - Human Language */}
            {subtitle && (
              <p
                className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/95 mb-4 sm:mb-6 drop-shadow-lg font-medium max-w-4xl mx-auto px-4"
                style={{
                  fontFamily:
                    "Montserrat, Century Gothic, system-ui, sans-serif",
                }}
              >
                {subtitle}
              </p>
            )}

            {description && (
              <p
                className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-8 sm:mb-10 drop-shadow-md max-w-3xl mx-auto leading-relaxed px-4"
                style={{
                  fontFamily:
                    "Montserrat, Century Gothic, system-ui, sans-serif",
                }}
              >
                {description}
              </p>
            )}

            {/* CTA Buttons - Custom Layout */}
            {(ctaPrimary || ctaSecondary) && (
              <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 mb-8 sm:mb-12 px-4">
                {ctaPrimary && (
                  <a href={ctaPrimary.href} className="w-full sm:w-auto">
                    <OMButton
                      variant="primary"
                      size="lg"
                      className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg shadow-xl hover:shadow-2xl rounded-full text-center"
                    >
                      {ctaPrimary.text}
                    </OMButton>
                  </a>
                )}
                {ctaSecondary && (
                  <a href={ctaSecondary.href} className="w-full sm:w-auto">
                    <OMButton
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg border-2 border-white/80 text-white hover:bg-white hover:text-om-heritage-green backdrop-blur-sm rounded-full text-center"
                    >
                      {ctaSecondary.text}
                    </OMButton>
                  </a>
                )}
              </div>
            )}

            {/* Pitch Points - Custom Grid Layout */}
            {points && points.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto mt-12 sm:mt-16 px-4">
                {points.map((point, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 + idx * 0.15 }}
                    className="flex items-center gap-3 text-white/90 bg-white/5 backdrop-blur-sm rounded-full px-4 sm:px-6 py-2.5 sm:py-3 border border-white/10"
                  >
                    <div className="text-om-fresh-green flex-shrink-0">
                      {point.icon}
                    </div>
                    <span className="text-xs sm:text-sm md:text-base font-medium break-words">
                      {point.text}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

