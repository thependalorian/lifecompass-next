// components/providers/ToastProvider.tsx
// Toast notification provider using react-hot-toast

"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "#fff",
          color: "#003B5C",
          border: "1px solid #E5E7EB",
          borderRadius: "0.5rem",
          padding: "1rem",
          boxShadow:
            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        },
        success: {
          iconTheme: {
            primary: "#00A651",
            secondary: "#fff",
          },
          style: {
            borderLeft: "4px solid #00A651",
          },
        },
        error: {
          iconTheme: {
            primary: "#D32F2F",
            secondary: "#fff",
          },
          style: {
            borderLeft: "4px solid #D32F2F",
          },
        },
      }}
    />
  );
}
