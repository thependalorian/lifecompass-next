/**
 * Corporate Layout Template
 * Location: /components/templates/CorporateLayout.tsx
 * Purpose: Unified layout for all pages following Old Mutual Corporate brand guidelines
 * Brand Guidelines: Primary vignette lines, brand line, capability name, typography
 */

"use client";

import { ReactNode } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Breadcrumbs } from "@/components/molecules/Breadcrumbs";

interface CorporateLayoutProps {
  children: ReactNode;
  heroTitle?: string;
  heroSubtitle?: string;
  heroBackground?: string;
  showChat?: boolean;
  showVignette?: boolean;
  vignetteDirection?: "horizontal" | "vertical";
  pageType?: "customer" | "advisor";
  showBreadcrumbs?: boolean;
  breadcrumbItems?: Array<{ label: string; href: string }>;
}

export function CorporateLayout({
  children,
  heroTitle,
  heroSubtitle,
  heroBackground,
  showChat = true,
  showVignette = true,
  vignetteDirection = "horizontal",
  pageType = "customer",
  showBreadcrumbs = false,
  breadcrumbItems,
}: CorporateLayoutProps) {
  return (
    <div className="min-h-screen bg-base-100">
      <Navigation type={pageType} />

      {/* Breadcrumbs - Show after persona selection */}
      {showBreadcrumbs && (
        <Breadcrumbs items={breadcrumbItems} showBackButton={true} />
      )}

      {/* Primary Vignette Line - Top of page */}
      {showVignette && (
        <div
          className={`h-1 ${
            vignetteDirection === "horizontal"
              ? "bg-vignette-primary-horizontal"
              : "bg-vignette-primary-vertical"
          }`}
          style={{
            background:
              vignetteDirection === "horizontal"
                ? "linear-gradient(90deg, #8dc63f 40%, #009677 60%)"
                : "linear-gradient(180deg, #8dc63f 0%, #009677 100%)",
          }}
        />
      )}

      {/* Hero Section - Brand Compliant */}
      {heroTitle && (
        <section className="relative min-h-[400px] md:min-h-[500px] flex items-center text-white overflow-hidden hero-bg-om">
          {/* Background Image */}
          {heroBackground && (
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url('${heroBackground}')`,
              }}
            />
          )}

          {/* Dark overlay for copy space - Brand Guidelines */}
          <div className="absolute inset-0 overlay-om-dark" />

          {/* Vignette gradient overlay - Brand Guidelines */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background:
                vignetteDirection === "horizontal"
                  ? "linear-gradient(90deg, rgba(141, 198, 63, 0.3) 0%, rgba(0, 150, 119, 0.4) 50%, transparent 100%)"
                  : "linear-gradient(180deg, rgba(0, 150, 119, 0.3) 0%, rgba(141, 198, 63, 0.2) 50%, transparent 100%)",
            }}
          />

          {/* Content */}
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl">
              <h1
                className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 drop-shadow-lg text-om-heading"
                style={{
                  fontFamily:
                    "Montserrat, Century Gothic, system-ui, sans-serif",
                  fontWeight: 700,
                }}
              >
                {heroTitle}
              </h1>
              {heroSubtitle && (
                <p
                  className="text-lg md:text-xl text-white/95 drop-shadow-md text-om-body"
                  style={{
                    fontFamily:
                      "Montserrat, Century Gothic, system-ui, sans-serif",
                  }}
                >
                  {heroSubtitle}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className="relative">{children}</main>

      {/* Brand Footer - Brand Line and Capability Name */}
      <div className="brand-footer-om">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Capability Name and Brand Line */}
            <div className="flex flex-col items-center md:items-start">
              <div className="text-om-capability text-om-capability-light text-2xl mb-2">
                CORPORATE
              </div>
              <div className="text-om-brand-line text-sm">
                DO GREAT THINGS EVERY DAY
              </div>
            </div>

            {/* Legal Disclaimer */}
            <div
              className="text-om-caption text-base-content/70 text-center md:text-right"
              style={{ maxWidth: "400px" }}
            >
              Old Mutual Life Assurance Company (SA) Limited is a licensed FSP
              and Life Insurer.
            </div>
          </div>
        </div>
      </div>

      {/* Chat is now provided by CopilotKitProvider via CopilotSidebar */}
      {/* The CopilotSidebar is available throughout the app and can be toggled */}

      <Footer />
    </div>
  );
}
