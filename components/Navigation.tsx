// components/Navigation.tsx

"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Bars3Icon, XMarkIcon, HomeIcon } from "@heroicons/react/24/outline";

interface NavLink {
  name: string;
  href: string;
}

// Empty links array - homepage navigation only shows CTAs to funnel users
const customerLinks: NavLink[] = [];
const advisorLinks: NavLink[] = [];

export default function Navigation({
  type = "customer",
}: {
  type?: "customer" | "advisor";
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-base-100 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo and Home Icon */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Home Icon - Always goes to landing page */}
            <Link
              href="/"
              className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-om-heritage-green/10 hover:bg-om-heritage-green/20 text-om-heritage-green flex items-center justify-center transition-all duration-200 active:scale-95 flex-shrink-0"
              title="Home"
              aria-label="Go to home page"
            >
              <HomeIcon className="w-4 h-4 md:w-5 md:h-5" />
            </Link>
            
            {/* Logo */}
            <Link
              href={type === "advisor" ? "/advisor" : "/"}
              className="flex items-center"
            >
              <Image
                src="/logos/om_lifecompass_logo.jpg"
                alt="Old Mutual Life Compass Logo"
                width={250}
                height={50}
                className="h-10 md:h-14 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation - CTAs Only */}
          <div className="hidden md:flex items-center space-x-3">
            {type === "customer" ? (
              <>
                <Link
                  href="/customer/select"
                  className="px-4 lg:px-6 py-2.5 rounded-full text-xs lg:text-sm font-semibold bg-om-heritage-green text-white hover:bg-om-fresh-green active:scale-95 transition-all duration-200 shadow-sm whitespace-nowrap"
                >
                  Customer Experience
                </Link>
                <Link
                  href="/advisor/select"
                  className="px-4 lg:px-6 py-2.5 rounded-full text-xs lg:text-sm font-semibold bg-white text-om-heritage-green border-2 border-om-heritage-green hover:bg-om-grey-5 active:scale-95 transition-all duration-200 whitespace-nowrap"
                >
                  Advisor Experience
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/customer/select"
                  className="px-4 lg:px-6 py-2.5 rounded-full text-xs lg:text-sm font-semibold bg-white text-om-heritage-green border-2 border-om-heritage-green hover:bg-om-grey-5 active:scale-95 transition-all duration-200 whitespace-nowrap"
                >
                  Customer Experience
                </Link>
              <Link
                  href="/advisor/select"
                  className="px-4 lg:px-6 py-2.5 rounded-full text-xs lg:text-sm font-semibold bg-om-heritage-green text-white hover:bg-om-fresh-green active:scale-95 transition-all duration-200 shadow-sm whitespace-nowrap"
              >
                  Advisor Experience
              </Link>
              </>
            )}
          </div>

          {/* Profile/Actions - Removed for homepage */}
          {/* <div className="hidden md:flex items-center space-x-3">
            <button className="w-10 h-10 rounded-full bg-om-heritage-green text-white hover:bg-om-fresh-green active:scale-95 transition-all duration-200 flex items-center justify-center shadow-sm">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </button>
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-om-heritage-green text-white hover:bg-om-fresh-green active:scale-95 transition-all duration-200 flex items-center justify-center shadow-sm font-semibold text-sm">
                  JD
                </div>
              </label>
              <ul
                tabIndex={0}
                className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
              >
                <li>
                  <a>Profile</a>
                </li>
                <li>
                  <a>Settings</a>
                </li>
                <li>
                  <a>Logout</a>
                </li>
              </ul>
            </div>
          </div> */}

          {/* Mobile menu button */}
          <button
            className="md:hidden w-10 h-10 rounded-full bg-om-heritage-green text-white hover:bg-om-fresh-green active:scale-95 transition-all duration-200 flex items-center justify-center shadow-sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation - CTAs Only */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t space-y-2 px-2">
            {/* Home Link in Mobile Menu */}
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-3 rounded-full text-xs sm:text-sm font-semibold bg-om-grey-5 text-om-heritage-green hover:bg-om-grey-10 active:scale-95 transition-all duration-200"
            >
              <HomeIcon className="w-5 h-5" />
              <span>Home</span>
            </Link>
            
            {type === "customer" ? (
              <>
              <Link
                  href="/customer/select"
                  onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-full text-xs sm:text-sm font-semibold bg-om-heritage-green text-white hover:bg-om-fresh-green active:scale-95 transition-all duration-200 shadow-sm text-center break-words"
                >
                  Customer Experience
                </Link>
                <Link
                  href="/advisor/select"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-full text-xs sm:text-sm font-semibold bg-white text-om-heritage-green border-2 border-om-heritage-green hover:bg-om-grey-5 active:scale-95 transition-all duration-200 text-center break-words"
                >
                  Advisor Experience
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/customer/select"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-full text-xs sm:text-sm font-semibold bg-white text-om-heritage-green border-2 border-om-heritage-green hover:bg-om-grey-5 active:scale-95 transition-all duration-200 text-center break-words"
                >
                  Customer Experience
                </Link>
                <Link
                  href="/advisor/select"
                onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-full text-xs sm:text-sm font-semibold bg-om-heritage-green text-white hover:bg-om-fresh-green active:scale-95 transition-all duration-200 shadow-sm text-center break-words"
              >
                  Advisor Experience
              </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
