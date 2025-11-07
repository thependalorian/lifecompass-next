// app/not-found.tsx
// 404 Not Found page for Next.js App Router
// Location: /app/not-found.tsx
// Purpose: Handle 404 errors with branded Old Mutual LifeCompass styling

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { CorporateLayout } from "@/components/templates/CorporateLayout";
import { OMButton } from "@/components/atoms/brand";

export default function NotFound() {
  const pathname = usePathname();

  return (
    <CorporateLayout
      heroTitle="Page Not Found"
      heroSubtitle="The page you're looking for doesn't exist"
      pageType="customer"
      showBreadcrumbs={false}
    >
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="text-9xl md:text-[12rem] font-bold text-om-heritage-green/20 mb-4">
              404
            </div>
            <div className="h-1 w-24 bg-om-heritage-green mx-auto mb-6"></div>
          </div>

          {/* Error Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-om-navy mb-4">
            Page Not Found
          </h1>
          <p className="text-lg text-om-grey mb-2">
            The page you're looking for doesn't exist or has been moved.
          </p>
          {pathname && (
            <p className="text-sm text-om-grey/70 mb-8 font-mono bg-base-200 px-3 py-2 rounded-lg inline-block">
              {pathname}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
            <Link href="/">
              <OMButton
                variant="primary"
                size="lg"
                className="w-full sm:w-auto px-8 py-4 text-lg"
              >
                <HomeIcon className="w-5 h-5 mr-2 inline" />
                Go to Homepage
              </OMButton>
            </Link>
            <button
              onClick={() => window.history.back()}
              className="btn btn-outline btn-lg w-full sm:w-auto px-8 py-4 text-lg border-2 border-om-heritage-green text-om-heritage-green hover:bg-om-heritage-green hover:text-white"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2 inline" />
              Go Back
            </button>
          </div>

          {/* Quick Links */}
          <div className="mt-12 pt-8 border-t border-base-300">
            <p className="text-sm text-om-grey mb-4">Quick Links:</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/customer/select"
                className="text-om-heritage-green hover:text-om-fresh-green hover:underline text-sm"
              >
                Customer Experience
              </Link>
              <span className="text-om-grey">•</span>
              <Link
                href="/advisor/select"
                className="text-om-heritage-green hover:text-om-fresh-green hover:underline text-sm"
              >
                Advisor Experience
              </Link>
              <span className="text-om-grey">•</span>
              <Link
                href="/products"
                className="text-om-heritage-green hover:text-om-fresh-green hover:underline text-sm"
              >
                Products
              </Link>
              <span className="text-om-grey">•</span>
              <Link
                href="/chat"
                className="text-om-heritage-green hover:text-om-fresh-green hover:underline text-sm"
              >
                Chat
              </Link>
            </div>
          </div>
        </div>
      </div>
    </CorporateLayout>
  );
}

