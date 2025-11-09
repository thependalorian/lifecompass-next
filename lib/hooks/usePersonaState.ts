// lib/hooks/usePersonaState.ts
// Shared hook for persona state management
// Purpose: Eliminate duplicate persona state polling across components
// Used by: CopilotKitProvider, FloatingChatWidget, app/chat/page.tsx

"use client";

import { useState, useEffect } from "react";

export interface PersonaState {
  customerPersona: string | null;
  advisorPersona: string | null;
  userType: "customer" | "advisor";
}

/**
 * Shared hook for managing persona state from sessionStorage
 *
 * Features:
 * - Event-based updates (preferred - instant)
 * - Polling fallback (5 seconds - for same-tab updates)
 * - Consistent across all components
 *
 * Usage:
 * ```tsx
 * const personaState = usePersonaState();
 * // personaState.customerPersona, personaState.advisorPersona, personaState.userType
 * ```
 */
export function usePersonaState(): PersonaState {
  const [personaState, setPersonaState] = useState<PersonaState>({
    customerPersona: null,
    advisorPersona: null,
    userType: "customer",
  });

  useEffect(() => {
    const updatePersonaState = () => {
      if (typeof window !== "undefined") {
        const customerPersona = sessionStorage.getItem(
          "selectedCustomerPersona",
        );
        const advisorPersona = sessionStorage.getItem("selectedAdvisorPersona");
        setPersonaState({
          customerPersona,
          advisorPersona,
          userType: advisorPersona ? "advisor" : "customer",
        });
      }
    };

    // Initial update
    updatePersonaState();

    // Event-based updates (preferred - instant, no polling)
    // Storage event fires when sessionStorage changes in other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === "selectedCustomerPersona" ||
        e.key === "selectedAdvisorPersona" ||
        e.key === null // null means entire storage was cleared
      ) {
        updatePersonaState();
      }
    };

    // Custom event for same-tab updates (when persona is set programmatically)
    const handleCustomStorage = () => {
      updatePersonaState();
    };

    // Listen for route changes (persona might change on navigation)
    const handleRouteChange = () => {
      updatePersonaState();
    };

    // Register event listeners
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("personaChanged", handleCustomStorage);
    window.addEventListener("popstate", handleRouteChange);

    // Polling fallback (5 seconds) - only needed for same-tab updates
    // that don't trigger storage events
    const interval = setInterval(updatePersonaState, 5000);

    // Cleanup
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("personaChanged", handleCustomStorage);
      window.removeEventListener("popstate", handleRouteChange);
      clearInterval(interval);
    };
  }, []);

  return personaState;
}

/**
 * Helper function to dispatch persona change event
 * Call this after updating sessionStorage to trigger instant updates
 *
 * Usage:
 * ```tsx
 * sessionStorage.setItem("selectedCustomerPersona", "CUST-001");
 * dispatchPersonaChanged();
 * ```
 */
export function dispatchPersonaChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("personaChanged"));
  }
}
