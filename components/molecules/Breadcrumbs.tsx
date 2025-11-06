/**
 * Breadcrumb Navigation Component
 * Provides back navigation and breadcrumb trail
 * Mobile-optimized with responsive design
 */

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRightIcon, ChevronLeftIcon, HomeIcon } from "@heroicons/react/24/outline";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  showBackButton?: boolean;
  backLabel?: string;
}

export function Breadcrumbs({
  items,
  showBackButton = true,
  backLabel = "Back",
}: BreadcrumbsProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Generate breadcrumbs from pathname if not provided
  const breadcrumbs: BreadcrumbItem[] = items || generateBreadcrumbs(pathname);

  const handleBack = () => {
    router.back();
  };

  return (
    <nav
      className="flex items-center gap-2 text-sm md:text-base py-2 md:py-3 px-4 bg-base-100 border-b border-base-300"
      aria-label="Breadcrumb navigation"
    >
      {/* Back Button - Mobile First */}
      {showBackButton && (
        <button
          onClick={handleBack}
          className="flex items-center gap-1 px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-om-heritage-green hover:bg-om-heritage-green/10 active:scale-95 transition-all duration-200 font-medium text-xs md:text-sm"
          aria-label="Go back to previous page"
        >
          <ChevronLeftIcon className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden sm:inline">{backLabel}</span>
        </button>
      )}

      {/* Home Icon - Always visible */}
      <Link
        href="/"
        className="flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-lg text-om-heritage-green hover:bg-om-heritage-green/10 active:scale-95 transition-all duration-200"
        aria-label="Go to home page"
      >
        <HomeIcon className="w-4 h-4 md:w-5 md:h-5" />
      </Link>

      {/* Breadcrumb Trail */}
      {breadcrumbs.length > 0 && (
        <div className="flex items-center gap-1 md:gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <ChevronRightIcon className="w-4 h-4 text-om-grey flex-shrink-0" />
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <div key={crumb.href} className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                {isLast ? (
                  <span className="text-om-navy font-medium text-xs md:text-sm whitespace-nowrap">
                    {crumb.label}
                  </span>
                ) : (
                  <>
                    <Link
                      href={crumb.href}
                      className="text-om-grey hover:text-om-heritage-green transition-colors text-xs md:text-sm whitespace-nowrap"
                    >
                      {crumb.label}
                    </Link>
                    <ChevronRightIcon className="w-4 h-4 text-om-grey flex-shrink-0" />
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </nav>
  );
}

// Generate breadcrumbs from pathname
function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const paths = pathname.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  // Skip if already on home page
  if (paths.length === 0) return [];

  // Build breadcrumb trail
  let currentPath = "";
  paths.forEach((path, index) => {
    currentPath += `/${path}`;
    
    // Format label (capitalize and replace hyphens)
    const label = formatPathLabel(path);
    
    breadcrumbs.push({
      label,
      href: currentPath,
    });
  });

  return breadcrumbs;
}

// Format path segment to readable label
function formatPathLabel(path: string): string {
  // Handle special cases
  const labelMap: Record<string, string> = {
    advisor: "Advisor",
    customer: "Customer",
    client: "Client",
    profile: "Profile",
    select: "Select",
    claims: "Claims",
    policies: "Policies",
    products: "Products",
    advisors: "Advisors",
    tools: "Tools",
    chat: "Chat",
    knowledge: "Knowledge",
    tasks: "Tasks",
    communicate: "Communicate",
    insights: "Insights",
    clients: "Clients",
  };

  // Check if it's a UUID or ID
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(path)) {
    return "Details";
  }

  // Use mapped label or capitalize
  return labelMap[path.toLowerCase()] || path.charAt(0).toUpperCase() + path.slice(1);
}

