// src/app/layout.tsx

import type { Metadata } from "next";

import "./globals.css";

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
      <body className="font-sans">{children}</body>
    </html>
  );
}
