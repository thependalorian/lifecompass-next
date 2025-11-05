/**
 * Customer Page Layout Template
 * Location: /components/templates/CustomerPageLayout.tsx
 * Purpose: Custom layout for all customer self-service pages
 * PRD: Mobile-optimized, guided journeys, context-aware help
 */

"use client";

import { ReactNode } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";

interface CustomerPageLayoutProps {
  children: ReactNode;
  heroTitle?: string;
  heroSubtitle?: string;
  heroBackground?: string;
  showChat?: boolean;
}

export function CustomerPageLayout({
  children,
  heroTitle,
  heroSubtitle,
  heroBackground,
  showChat = true,
}: CustomerPageLayoutProps) {
  return (
    <div className="min-h-screen bg-base-100">
      <Navigation type="customer" />

      {/* Hero Section - Custom Layout */}
      {heroTitle && (
        <section className="relative min-h-[400px] md:min-h-[500px] flex items-center text-white overflow-hidden">
          {/* Background Image */}
          {heroBackground && (
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url('${heroBackground}')`,
              }}
            />
          )}

          {/* Gradient Overlay - Custom for customer experience */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/50 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-om-heritage-green/35 via-om-fresh-green/25 to-transparent mix-blend-soft-light" />

          {/* Content */}
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl">
              <h1
                className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 drop-shadow-lg"
                style={{
                  fontFamily: "Montserrat, Century Gothic, system-ui, sans-serif",
                }}
              >
                {heroTitle}
              </h1>
              {heroSubtitle && (
                <p
                  className="text-lg md:text-xl text-white/95 drop-shadow-md"
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

      {/* Chat Widget - Always available for customer self-service */}
      {showChat && <ChatWidget />}

      <Footer />
    </div>
  );
}

