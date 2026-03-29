import { useState, useEffect, useCallback } from "react";

const THEME_CLASSES = [
  "theme-sunday",
  "theme-monday",
  "theme-tuesday",
  "theme-wednesday",
  "theme-thursday",
  "theme-friday",
  "theme-saturday",
] as const;

const THEME_LABELS = [
  "Minggu — Gradient Premium",
  "Senin — Biru",
  "Selasa — Hijau",
  "Rabu — Ungu",
  "Kamis — Orange",
  "Jumat — Merah",
  "Sabtu — Cyan",
] as const;

export type ThemeDay = (typeof THEME_CLASSES)[number];

function getDayTheme(): ThemeDay {
  const override = localStorage.getItem("mrexpress-theme-override");
  if (override && THEME_CLASSES.includes(override as ThemeDay)) {
    return override as ThemeDay;
  }
  return THEME_CLASSES[new Date().getDay()];
}

export function useDailyTheme() {
  const [theme, setThemeState] = useState<ThemeDay>(getDayTheme);

  const applyTheme = useCallback((t: ThemeDay) => {
    const root = document.documentElement;
    THEME_CLASSES.forEach((c) => root.classList.remove(c));
    root.classList.add(t);
  }, []);

  const setTheme = useCallback(
    (t: ThemeDay | "auto") => {
      if (t === "auto") {
        localStorage.removeItem("mrexpress-theme-override");
        const auto = THEME_CLASSES[new Date().getDay()];
        setThemeState(auto);
        applyTheme(auto);
      } else {
        localStorage.setItem("mrexpress-theme-override", t);
        setThemeState(t);
        applyTheme(t);
      }
    },
    [applyTheme],
  );

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  // Check for day change at midnight
  useEffect(() => {
    const checkDayChange = () => {
      if (!localStorage.getItem("mrexpress-theme-override")) {
        const newTheme = THEME_CLASSES[new Date().getDay()];
        if (newTheme !== theme) {
          setThemeState(newTheme);
          applyTheme(newTheme);
        }
      }
    };
    const interval = setInterval(checkDayChange, 60_000);
    return () => clearInterval(interval);
  }, [theme, applyTheme]);

  const isOverridden = !!localStorage.getItem("mrexpress-theme-override");

  return { theme, setTheme, isOverridden, THEME_CLASSES, THEME_LABELS };
}
