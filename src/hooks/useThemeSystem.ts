import { useState, useEffect, useCallback, useMemo } from "react";

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
  dates: { month: number; day: number; duration?: number }[];
  // For Hijri-based events we approximate with Gregorian dates that shift yearly
  // These are updated for ~2025-2027 range
}

// ─── Event Calendar (approximate Gregorian dates) ───
const EVENTS: EventInfo[] = [
  {
    id: "event-tahun-baru",
    label: "Tahun Baru",
    emoji: "🎆",
    dates: [{ month: 1, day: 1, duration: 2 }],
  },
  {
    id: "event-ramadhan",
    label: "Ramadhan",
    emoji: "🌙",
    // ~Feb 28 - Mar 29, 2025 / ~Mar 18 - Apr 16, 2026
    dates: [
      { month: 2, day: 28, duration: 30 }, // 2025
      { month: 3, day: 18, duration: 30 }, // 2026
    ],
  },
  {
    id: "event-idul-fitri",
    label: "Idul Fitri",
    emoji: "🕌",
    dates: [
      { month: 3, day: 30, duration: 4 }, // 2025
      { month: 4, day: 17, duration: 4 }, // 2026
    ],
  },
  {
    id: "event-idul-adha",
    label: "Idul Adha",
    emoji: "🐑",
    dates: [
      { month: 6, day: 6, duration: 3 }, // 2025
      { month: 6, day: 26, duration: 3 }, // 2026
    ],
  },
  {
    id: "event-tahun-baru-islam",
    label: "Tahun Baru Islam",
    emoji: "📿",
    dates: [
      { month: 6, day: 26, duration: 2 }, // 2025
      { month: 7, day: 16, duration: 2 }, // 2026
    ],
  },
  {
    id: "event-maulid-nabi",
    label: "Maulid Nabi",
    emoji: "✨",
    dates: [
      { month: 9, day: 5, duration: 2 }, // 2025
      { month: 9, day: 24, duration: 2 }, // 2026
    ],
  },
  {
    id: "event-isra-miraj",
    label: "Isra Mi'raj",
    emoji: "🌟",
    dates: [
      { month: 1, day: 27, duration: 2 }, // 2025
      { month: 2, day: 15, duration: 2 }, // 2026
    ],
  },
  {
    id: "event-17-agustus",
    label: "Hari Kemerdekaan",
    emoji: "🇮🇩",
    dates: [{ month: 8, day: 17, duration: 3 }],
  },
  {
    id: "event-hari-pahlawan",
    label: "Hari Pahlawan",
    emoji: "🎖️",
    dates: [{ month: 11, day: 10, duration: 2 }],
  },
  {
    id: "event-hari-santri",
    label: "Hari Santri",
    emoji: "📖",
    dates: [{ month: 10, day: 22, duration: 2 }],
  },
];

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

// ─── Check active event ───
function getActiveEvent(): EventInfo | null {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  for (const event of EVENTS) {
    for (const d of event.dates) {
      const duration = d.duration ?? 1;
      // Simple check: is today within [d.day, d.day + duration) in d.month?
      // Handle month overflow simply
      const startDay = d.day;
      const endDay = startDay + duration - 1;
      if (month === d.month && day >= startDay && day <= endDay) {
        return event;
      }
      // If event spans into next month (simplified)
      if (endDay > 31 && month === d.month + 1 && day <= endDay - 31) {
        return event;
      }
    }
  }
  return null;
}

// ─── All CSS classes to manage ───
const ALL_THEME_CLASSES = [
  ...DAILY_THEMES,
  "theme-dark",
  "theme-light",
  "theme-default",
  ...EVENTS.map((e) => e.id),
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

  const activeEvent = useMemo(() => getActiveEvent(), []);

  // Resolve the effective theme class based on priority
  const resolveTheme = useCallback((): string => {
    // Priority 1: Event active + event enabled
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
        // If no event active, fall back to default
        return activeEvent ? activeEvent.id : "theme-default";
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
    EVENTS,
  };
}
