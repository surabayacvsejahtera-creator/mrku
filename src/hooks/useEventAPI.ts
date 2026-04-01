import { useState, useEffect, useCallback } from "react";
import type { EventTheme } from "@/hooks/useThemeSystem";

// ─── Types ───
export interface APIHoliday {
  date: string;
  description: string;
}

export interface DetectedEvent {
  id: EventTheme;
  label: string;
  emoji: string;
  source: string; // "api" | "fallback"
}

// ─── API Config ───
const API_BASE = "https://api-hari-libur.vercel.app/api";
const CACHE_KEY = "mrx-holiday-cache";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// ─── Event keyword mapping ───
// Maps holiday descriptions from API to our theme IDs
const EVENT_MATCHERS: {
  keywords: string[];
  id: EventTheme;
  label: string;
  emoji: string;
}[] = [
  {
    keywords: ["ramadhan", "ramadan", "puasa"],
    id: "event-ramadhan",
    label: "Ramadhan",
    emoji: "🌙",
  },
  {
    keywords: ["idul fitri", "idulfitri", "lebaran"],
    id: "event-idul-fitri",
    label: "Idul Fitri",
    emoji: "🕌",
  },
  {
    keywords: ["idul adha", "iduladha"],
    id: "event-idul-adha",
    label: "Idul Adha",
    emoji: "🐑",
  },
  {
    keywords: ["maulid nabi", "maulud"],
    id: "event-maulid-nabi",
    label: "Maulid Nabi",
    emoji: "✨",
  },
  {
    keywords: ["isra", "mi'raj", "miraj"],
    id: "event-isra-miraj",
    label: "Isra Mi'raj",
    emoji: "🌟",
  },
  {
    keywords: ["tahun baru islam", "1 muharram", "muharram"],
    id: "event-tahun-baru-islam",
    label: "Tahun Baru Islam",
    emoji: "📿",
  },
  {
    keywords: ["kemerdekaan", "17 agustus"],
    id: "event-17-agustus",
    label: "Hari Kemerdekaan",
    emoji: "🇮🇩",
  },
  {
    keywords: ["hari pahlawan"],
    id: "event-hari-pahlawan",
    label: "Hari Pahlawan",
    emoji: "🎖️",
  },
  {
    keywords: ["hari santri"],
    id: "event-hari-santri",
    label: "Hari Santri",
    emoji: "📖",
  },
  {
    keywords: ["tahun baru masehi", "tahun baru 20"],
    id: "event-tahun-baru",
    label: "Tahun Baru",
    emoji: "🎆",
  },
  {
    keywords: ["natal"],
    id: "event-tahun-baru", // Christmas uses festive theme
    label: "Hari Natal",
    emoji: "🎄",
  },
];

// ─── Cache helpers ───
interface CacheData {
  holidays: APIHoliday[];
  timestamp: number;
  year: number;
  month: number;
}

function getCache(): CacheData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data: CacheData = JSON.parse(raw);
    const now = Date.now();
    if (now - data.timestamp > CACHE_DURATION) return null;
    // Check same year/month
    const today = new Date();
    if (data.year !== today.getFullYear() || data.month !== today.getMonth() + 1) return null;
    return data;
  } catch {
    return null;
  }
}

function setCache(holidays: APIHoliday[]) {
  const today = new Date();
  const data: CacheData = {
    holidays,
    timestamp: Date.now(),
    year: today.getFullYear(),
    month: today.getMonth() + 1,
  };
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // localStorage full, ignore
  }
}

// ─── Match holiday description to event ───
function matchHolidayToEvent(description: string): DetectedEvent | null {
  const lower = description.toLowerCase();
  for (const matcher of EVENT_MATCHERS) {
    if (matcher.keywords.some((kw) => lower.includes(kw))) {
      return {
        id: matcher.id,
        label: matcher.label,
        emoji: matcher.emoji,
        source: "api",
      };
    }
  }
  return null;
}

// ─── Also check surrounding days for multi-day events ───
// Some events (like Idul Fitri) span multiple days with "Cuti Bersama"
// We check if today or surrounding days have event markers
function findTodayEvent(holidays: APIHoliday[]): DetectedEvent | null {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0]; // YYYY-MM-DD

  // Direct match for today
  for (const h of holidays) {
    if (h.date === todayStr) {
      const event = matchHolidayToEvent(h.description);
      if (event) return event;
    }
  }

  // Check if today is a "Cuti Bersama" day - these also map to events
  for (const h of holidays) {
    if (h.date === todayStr && h.description.toLowerCase().includes("cuti bersama")) {
      // Find the parent event by looking at nearby dates
      for (const h2 of holidays) {
        if (!h2.description.toLowerCase().includes("cuti bersama")) {
          const event = matchHolidayToEvent(h2.description);
          if (event) {
            // Check if this non-cuti event is within 7 days
            const eventDate = new Date(h2.date);
            const diffDays = Math.abs(
              (today.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24)
            );
            if (diffDays <= 7) return event;
          }
        }
      }
    }
  }

  return null;
}

// ─── Hook ───
export function useEventAPI() {
  const [detectedEvent, setDetectedEvent] = useState<DetectedEvent | null>(null);
  const [holidays, setHolidays] = useState<APIHoliday[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<"api" | "cache" | "fallback">("fallback");

  const fetchHolidays = useCallback(async () => {
    // 1. Check cache first
    const cached = getCache();
    if (cached) {
      setHolidays(cached.holidays);
      const event = findTodayEvent(cached.holidays);
      setDetectedEvent(event);
      setDataSource("cache");
      setLoading(false);
      return;
    }

    // 2. Fetch from API
    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;

      const res = await fetch(`${API_BASE}?year=${year}&month=${month}`, {
        signal: AbortSignal.timeout(8000), // 8s timeout
      });

      if (!res.ok) throw new Error(`API returned ${res.status}`);

      const json = await res.json();
      if (json.status === "success" && Array.isArray(json.data)) {
        const holidayData: APIHoliday[] = json.data;
        setHolidays(holidayData);
        setCache(holidayData);
        const event = findTodayEvent(holidayData);
        setDetectedEvent(event);
        setDataSource("api");
      } else {
        throw new Error("Invalid API response format");
      }
    } catch (err) {
      console.warn("[EventAPI] Fetch failed, using fallback:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setDataSource("fallback");
      // Fallback: no event detected, daily theme will be used
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  return {
    detectedEvent,
    holidays,
    loading,
    error,
    dataSource,
    refetch: fetchHolidays,
  };
}
