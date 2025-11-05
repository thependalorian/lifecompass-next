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
    <section className="relative min-h-[750px] md:min-h-[850px] flex items-center text-white overflow-hidden">
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
              className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-8 drop-shadow-2xl leading-tight"
              style={{
                fontFamily: "Montserrat, Century Gothic, system-ui, sans-serif",
              }}
            >
              {title}
              {titleHighlight && (
                <span className="block mt-3 bg-gradient-to-r from-om-future-green via-om-fresh-green to-om-heritage-green bg-clip-text text-transparent">
                  {titleHighlight}
                </span>
              )}
            </h1>

            {/* Subheadline - Human Language */}
            {subtitle && (
              <p
                className="text-xl md:text-2xl lg:text-3xl text-white/95 mb-6 drop-shadow-lg font-medium max-w-4xl mx-auto"
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
                className="text-lg md:text-xl lg:text-2xl text-white/90 mb-10 drop-shadow-md max-w-3xl mx-auto leading-relaxed"
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
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                {ctaPrimary && (
                  <a href={ctaPrimary.href}>
                    <OMButton
                      variant="primary"
                      size="lg"
                      className="px-8 py-4 text-lg shadow-xl hover:shadow-2xl rounded-full text-center"
                    >
                      {ctaPrimary.text}
                    </OMButton>
                  </a>
                )}
                {ctaSecondary && (
                  <a href={ctaSecondary.href}>
                    <OMButton
                      variant="outline"
                      size="lg"
                      className="px-8 py-4 text-lg border-2 border-white/80 text-white hover:bg-white hover:text-om-heritage-green backdrop-blur-sm rounded-full text-center"
                    >
                      {ctaSecondary.text}
                    </OMButton>
                  </a>
                )}
              </div>
            )}

            {/* Pitch Points - Custom Grid Layout */}
            {points && points.length > 0 && (
              <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-16">
                {points.map((point, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 + idx * 0.15 }}
                    className="flex items-center gap-3 text-white/90 bg-white/5 backdrop-blur-sm rounded-full px-6 py-3 border border-white/10"
                  >
                    <div className="text-om-fresh-green flex-shrink-0">
                      {point.icon}
                    </div>
                    <span className="text-sm md:text-base font-medium">
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

