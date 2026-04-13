import { useEffect, useCallback, useMemo } from "react";
import { useEventAPI, type DetectedEvent } from "@/hooks/useEventAPI";

// ─── Theme Types ───
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

export type DailyTheme =
  | "theme-sunday"
  | "theme-monday"
  | "theme-tuesday"
  | "theme-wednesday"
  | "theme-thursday"
  | "theme-friday"
  | "theme-saturday";

export interface EventInfo {
  id: EventTheme;
  label: string;
  emoji: string;
}

// ─── WIB helper (UTC+7) ───
function getWIBDate(): Date {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 7 * 3600000);
}

const DAILY_THEMES: DailyTheme[] = [
  "theme-sunday",
  "theme-monday",
  "theme-tuesday",
  "theme-wednesday",
  "theme-thursday",
  "theme-friday",
  "theme-saturday",
];

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
  if (className) root.classList.add(className);
  if (className === "theme-dark") root.classList.add("dark");
}

// ─── Hook: Fully automatic ───
export function useThemeSystem() {
  const { detectedEvent, loading: eventLoading, dataSource, holidays } = useEventAPI();

  // Convert DetectedEvent to EventInfo
  const activeEvent: EventInfo | null = useMemo(() => {
    if (!detectedEvent) return null;
    return { id: detectedEvent.id, label: detectedEvent.label, emoji: detectedEvent.emoji };
  }, [detectedEvent]);

  // Resolve theme: event takes priority, otherwise daily
  const resolveTheme = useCallback((): string => {
    if (activeEvent) return activeEvent.id;
    return DAILY_THEMES[getWIBDate().getDay()];
  }, [activeEvent]);

  // Apply theme
  useEffect(() => {
    applyClasses(resolveTheme());
  }, [resolveTheme]);

  // Check for day change
  useEffect(() => {
    const interval = setInterval(() => {
      applyClasses(resolveTheme());
    }, 60_000);
    return () => clearInterval(interval);
  }, [resolveTheme]);

  return {
    activeEvent,
    eventEnabled: true, // always enabled
    EVENTS: KNOWN_EVENTS,
    eventLoading,
    dataSource,
    holidays,
  };
}
