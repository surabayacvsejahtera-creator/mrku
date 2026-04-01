import { useState, useEffect, useCallback, useMemo } from "react";
import { useEventAPI, type DetectedEvent } from "@/hooks/useEventAPI";

// ─── Theme Types ───
export type ThemeMode = "default" | "dark" | "light" | "daily" | "event";

export type DailyTheme =
  | "theme-sunday"
  | "theme-monday"
  | "theme-tuesday"
  | "theme-wednesday"
  | "theme-thursday"
  | "theme-friday"
  | "theme-saturday";

export type EventTheme =
  | "event-ramadhan"
  | "event-idul-fitri"
  | "event-idul-adha"
  | "event-maulid-nabi"
  | "event-isra-miraj"
  | "event-tahun-baru-islam"
  | "event-17-agustus"
  | "event-hari-pahlawan"
  | "event-hari-santri"
  | "event-tahun-baru";

export interface EventInfo {
  id: EventTheme;
  label: string;
  emoji: string;
}

// ─── Storage Keys ───
const STORAGE_KEY_MODE = "mrx-theme-mode";
const STORAGE_KEY_EVENT = "mrx-event-enabled";

// ─── Daily theme helper ───
const DAILY_THEMES: DailyTheme[] = [
  "theme-sunday",
  "theme-monday",
  "theme-tuesday",
  "theme-wednesday",
  "theme-thursday",
  "theme-friday",
  "theme-saturday",
];

const DAILY_LABELS = [
  "Minggu — Gradient",
  "Senin — Biru",
  "Selasa — Hijau",
  "Rabu — Ungu",
  "Kamis — Orange",
  "Jumat — Merah",
  "Sabtu — Cyan",
];

const MODE_LABELS: Record<ThemeMode, string> = {
  default: "Default (Biru)",
  dark: "Dark Mode",
  light: "Light Mode",
  daily: "Auto Harian",
  event: "Event Otomatis",
};

// ─── Known events list (for display in settings) ───
const KNOWN_EVENTS: EventInfo[] = [
  { id: "event-ramadhan", label: "Ramadhan", emoji: "🌙" },
  { id: "event-idul-fitri", label: "Idul Fitri", emoji: "🕌" },
  { id: "event-idul-adha", label: "Idul Adha", emoji: "🐑" },
  { id: "event-maulid-nabi", label: "Maulid Nabi", emoji: "✨" },
  { id: "event-isra-miraj", label: "Isra Mi'raj", emoji: "🌟" },
  { id: "event-tahun-baru-islam", label: "Tahun Baru Islam", emoji: "📿" },
  { id: "event-17-agustus", label: "Hari Kemerdekaan", emoji: "🇮🇩" },
  { id: "event-hari-pahlawan", label: "Hari Pahlawan", emoji: "🎖️" },
  { id: "event-hari-santri", label: "Hari Santri", emoji: "📖" },
  { id: "event-tahun-baru", label: "Tahun Baru", emoji: "🎆" },
];

// ─── All CSS classes to manage ───
const ALL_THEME_CLASSES = [
  ...DAILY_THEMES,
  "theme-dark",
  "theme-light",
  "theme-default",
  ...KNOWN_EVENTS.map((e) => e.id),
];

function applyClasses(className: string) {
  const root = document.documentElement;
  ALL_THEME_CLASSES.forEach((c) => root.classList.remove(c));
  root.classList.remove("dark");
  if (className) {
    root.classList.add(className);
  }
  if (className === "theme-dark") {
    root.classList.add("dark");
  }
}

// ─── Hook ───
export function useThemeSystem() {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MODE);
    if (saved && ["default", "dark", "light", "daily", "event"].includes(saved)) {
      return saved as ThemeMode;
    }
    return "default";
  });

  const [eventEnabled, setEventEnabledState] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_EVENT);
    return saved !== "false"; // default ON
  });

  // ─── Real-time event data from API ───
  const { detectedEvent, loading: eventLoading, dataSource, holidays } = useEventAPI();

  // Convert DetectedEvent to EventInfo for backward compatibility
  const activeEvent: EventInfo | null = useMemo(() => {
    if (!detectedEvent) return null;
    return {
      id: detectedEvent.id,
      label: detectedEvent.label,
      emoji: detectedEvent.emoji,
    };
  }, [detectedEvent]);

  // Resolve the effective theme class based on priority
  const resolveTheme = useCallback((): string => {
    // Priority 1: Event active + event enabled (auto from API)
    if (eventEnabled && activeEvent) {
      return activeEvent.id;
    }
    // Priority 2: User manual choice
    switch (mode) {
      case "dark":
        return "theme-dark";
      case "light":
        return "theme-light";
      case "daily":
        return DAILY_THEMES[new Date().getDay()];
      case "event":
        // If no event active, fall back to daily theme
        return activeEvent ? activeEvent.id : DAILY_THEMES[new Date().getDay()];
      case "default":
      default:
        return "theme-default";
    }
  }, [mode, eventEnabled, activeEvent]);

  // Apply theme
  useEffect(() => {
    const cls = resolveTheme();
    applyClasses(cls);
  }, [resolveTheme]);

  // Check for day change (for daily mode)
  useEffect(() => {
    if (mode !== "daily") return;
    const interval = setInterval(() => {
      const cls = resolveTheme();
      applyClasses(cls);
    }, 60_000);
    return () => clearInterval(interval);
  }, [mode, resolveTheme]);

  const setMode = useCallback((m: ThemeMode) => {
    localStorage.setItem(STORAGE_KEY_MODE, m);
    setModeState(m);
  }, []);

  const setEventEnabled = useCallback((enabled: boolean) => {
    localStorage.setItem(STORAGE_KEY_EVENT, String(enabled));
    setEventEnabledState(enabled);
  }, []);

  return {
    mode,
    setMode,
    eventEnabled,
    setEventEnabled,
    activeEvent,
    DAILY_THEMES,
    DAILY_LABELS,
    MODE_LABELS,
    EVENTS: KNOWN_EVENTS,
    // New API-driven data
    eventLoading,
    dataSource,
    holidays,
  };
}
