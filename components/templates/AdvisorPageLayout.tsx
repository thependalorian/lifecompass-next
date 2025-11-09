/**
 * Advisor Page Layout Template
 * Location: /components/templates/AdvisorPageLayout.tsx
 * Purpose: Custom layout for all advisor command center pages
 * PRD: Desktop-first, keyboard shortcuts, bulk actions
 */

"use client";

import { ReactNode } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

interface AdvisorPageLayoutProps {
  children: ReactNode;
  headerTitle?: string;
  headerSubtitle?: string;
  headerActions?: ReactNode;
  showChat?: boolean;
}

export function AdvisorPageLayout({
  children,
  headerTitle,
  headerSubtitle,
  headerActions,
  showChat = true,
}: AdvisorPageLayoutProps) {
  return (
    <div className="min-h-screen bg-base-200">
      <Navigation type="advisor" />

      {/* Header Section - Custom for advisor experience */}
      {headerTitle && (
        <section className="bg-gradient-to-r from-om-navy via-om-heritage-green to-om-navy text-white py-6 md:py-8 border-b border-om-heritage-green/20">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-1">
                  {headerTitle}
                </h1>
                {headerSubtitle && (
                  <p className="text-white/90 text-sm md:text-base">
                    {headerSubtitle}
                  </p>
                )}
              </div>
              {headerActions && (
                <div className="flex items-center gap-3">{headerActions}</div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Main Content - Desktop-first layout */}
      <main className="container mx-auto px-4 py-6 md:py-8">{children}</main>

      {/* Chat is now provided by CopilotKitProvider via CopilotSidebar */}
      {/* The CopilotSidebar is available throughout the app and can be toggled */}

      <Footer />
    </div>
  );
}
