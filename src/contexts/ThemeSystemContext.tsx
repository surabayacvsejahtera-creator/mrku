import { createContext, useContext, type ReactNode } from "react";
import { useThemeSystem } from "@/hooks/useThemeSystem";

const ThemeSystemContext = createContext<ReturnType<typeof useThemeSystem> | null>(null);

export function ThemeSystemProvider({ children }: { children: ReactNode }) {
  const value = useThemeSystem();

  return <ThemeSystemContext.Provider value={value}>{children}</ThemeSystemContext.Provider>;
}

export function useThemeSystemContext() {
  const context = useContext(ThemeSystemContext);

  if (!context) {
    throw new Error("useThemeSystemContext must be used within ThemeSystemProvider");
  }

  return context;
}
