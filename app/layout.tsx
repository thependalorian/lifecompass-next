// src/app/layout.tsx

import type { Metadata } from "next";

import "./globals.css";
import { ToastProvider } from "@/components/providers/ToastProvider";

export const metadata: Metadata = {
  title: "LifeCompass by Old Mutual | Navigate Your Financial Future",

  description:
    "LifeCompass - Old Mutual Namibia's intelligent platform for customers and financial advisors. AI-powered assistance, expert guidance, and comprehensive financial solutions.",

  keywords: [
    "Old Mutual",

    "Namibia",

    "Life Insurance",

    "Financial Planning",

    "Investment",

    "LifeCompass",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="lifecompass">
      <body className="font-sans">
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
