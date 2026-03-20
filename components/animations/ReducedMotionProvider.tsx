// components/animations/ReducedMotionProvider.tsx

// ==============================
// Imports
// ==============================
import { useReducedMotion } from "framer-motion";
import * as React from "react";

// ==============================
// Context
// ==============================
const ReducedMotionContext = React.createContext<boolean>(false);

// ==============================
// Provider — apelează useReducedMotion() o singură dată global
// ==============================
export function ReducedMotionProvider({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return <ReducedMotionContext.Provider value={!!reduce}>{children}</ReducedMotionContext.Provider>;
}

// ==============================
// Hook — consumat în Appear / AppearGroup în loc de useReducedMotion()
// ==============================
export function useReducedMotionContext(): boolean {
  return React.useContext(ReducedMotionContext);
}
