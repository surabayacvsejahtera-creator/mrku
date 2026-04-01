import { useState, useEffect, useCallback, useRef } from "react";
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
  source: string;
}

// ─── API Config ───
// Primary: GitHub raw (CORS-friendly), Fallback: Vercel API
const GITHUB_RAW_BASE = "https://raw.githubusercontent.com/andifahruddinakas/api-hari-libur/main/data";
const API_FALLBACK = "https://api-hari-libur.vercel.app/api";
const CACHE_KEY = "mrx-holiday-cache";
const CACHE_DURATION = 24 * 60 * 60 * 1000;

// ─── Event keyword mapping ───
const EVENT_MATCHERS: {
  keywords: string[];
  id: EventTheme;
  label: string;
  emoji: string;
}[] = [
  { keywords: ["ramadhan", "ramadan", "puasa"], id: "event-ramadhan", label: "Ramadhan", emoji: "🌙" },
  { keywords: ["idul fitri", "idulfitri", "lebaran"], id: "event-idul-fitri", label: "Idul Fitri", emoji: "🕌" },
  { keywords: ["idul adha", "iduladha"], id: "event-idul-adha", label: "Idul Adha", emoji: "🐑" },
  { keywords: ["maulid nabi", "maulud"], id: "event-maulid-nabi", label: "Maulid Nabi", emoji: "✨" },
  { keywords: ["isra", "mi'raj", "miraj"], id: "event-isra-miraj", label: "Isra Mi'raj", emoji: "🌟" },
  { keywords: ["tahun baru islam", "1 muharram", "muharram"], id: "event-tahun-baru-islam", label: "Tahun Baru Islam", emoji: "📿" },
  { keywords: ["kemerdekaan", "17 agustus"], id: "event-17-agustus", label: "Hari Kemerdekaan", emoji: "🇮🇩" },
  { keywords: ["hari pahlawan"], id: "event-hari-pahlawan", label: "Hari Pahlawan", emoji: "🎖️" },
  { keywords: ["hari santri"], id: "event-hari-santri", label: "Hari Santri", emoji: "📖" },
  { keywords: ["tahun baru masehi", "tahun baru 20"], id: "event-tahun-baru", label: "Tahun Baru", emoji: "🎆" },
  { keywords: ["natal"], id: "event-tahun-baru", label: "Hari Natal", emoji: "🎄" },
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
    if (Date.now() - data.timestamp > CACHE_DURATION) return null;
    const today = new Date();
    if (data.year !== today.getFullYear() || data.month !== today.getMonth() + 1) return null;
    return data;
  } catch {
    return null;
  }
}

function setCache(holidays: APIHoliday[]) {
  const today = new Date();
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      holidays,
      timestamp: Date.now(),
      year: today.getFullYear(),
      month: today.getMonth() + 1,
    }));
  } catch { /* ignore */ }
}

function matchHolidayToEvent(description: string): DetectedEvent | null {
  const lower = description.toLowerCase();
  for (const matcher of EVENT_MATCHERS) {
    if (matcher.keywords.some((kw) => lower.includes(kw))) {
      return { id: matcher.id, label: matcher.label, emoji: matcher.emoji, source: "api" };
    }
  }
  return null;
}

function findTodayEvent(holidays: APIHoliday[]): DetectedEvent | null {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  for (const h of holidays) {
    if (h.date === todayStr) {
      const event = matchHolidayToEvent(h.description);
      if (event) return event;
    }
  }

  // Check "Cuti Bersama" days
  for (const h of holidays) {
    if (h.date === todayStr && h.description.toLowerCase().includes("cuti bersama")) {
      for (const h2 of holidays) {
        if (!h2.description.toLowerCase().includes("cuti bersama")) {
          const event = matchHolidayToEvent(h2.description);
          if (event) {
            const diffDays = Math.abs(
              (today.getTime() - new Date(h2.date).getTime()) / (1000 * 60 * 60 * 24)
            );
            if (diffDays <= 7) return event;
          }
        }
      }
    }
  }

  return null;
}

// ─── Module-level singleton to prevent multiple fetches ───
let _sharedResult: {
  detectedEvent: DetectedEvent | null;
  holidays: APIHoliday[];
  loading: boolean;
  error: string | null;
  dataSource: "api" | "cache" | "fallback";
} | null = null;

let _fetchPromise: Promise<void> | null = null;
let _listeners: Set<() => void> = new Set();

function notifyListeners() {
  _listeners.forEach((fn) => fn());
}

async function doFetch() {
  if (_sharedResult && !_sharedResult.loading) return;

  _sharedResult = {
    detectedEvent: null,
    holidays: [],
    loading: true,
    error: null,
    dataSource: "fallback",
  };

  // Check cache
  const cached = getCache();
  if (cached) {
    _sharedResult = {
      detectedEvent: findTodayEvent(cached.holidays),
      holidays: cached.holidays,
      loading: false,
      error: null,
      dataSource: "cache",
    };
    notifyListeners();
    return;
  }

  // Fetch from API
  try {
    const today = new Date();
    const res = await fetch(
      `${API_BASE}?year=${today.getFullYear()}&month=${today.getMonth() + 1}`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const json = await res.json();
    if (json.status === "success" && Array.isArray(json.data)) {
      const holidayData: APIHoliday[] = json.data;
      setCache(holidayData);
      _sharedResult = {
        detectedEvent: findTodayEvent(holidayData),
        holidays: holidayData,
        loading: false,
        error: null,
        dataSource: "api",
      };
    } else {
      throw new Error("Invalid API response");
    }
  } catch (err) {
    console.warn("[EventAPI] Fetch failed, using fallback:", err);
    _sharedResult = {
      detectedEvent: null,
      holidays: [],
      loading: false,
      error: err instanceof Error ? err.message : "Unknown error",
      dataSource: "fallback",
    };
  }
  notifyListeners();
}

// ─── Hook (safe to call from multiple components) ───
export function useEventAPI() {
  const [, forceUpdate] = useState(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const listener = () => {
      if (mountedRef.current) forceUpdate((n) => n + 1);
    };
    _listeners.add(listener);

    // Trigger fetch only once
    if (!_fetchPromise) {
      _fetchPromise = doFetch();
    }

    return () => {
      mountedRef.current = false;
      _listeners.delete(listener);
    };
  }, []);

  return _sharedResult ?? {
    detectedEvent: null,
    holidays: [] as APIHoliday[],
    loading: true,
    error: null,
    dataSource: "fallback" as const,
  };
}
