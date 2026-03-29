import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, X, RotateCcw } from "lucide-react";
import { useDailyTheme, type ThemeDay } from "@/hooks/useDailyTheme";

const colorMap: Record<ThemeDay, string> = {
  "theme-sunday": "bg-gradient-to-r from-rose-400 to-purple-500",
  "theme-monday": "bg-blue-500",
  "theme-tuesday": "bg-green-500",
  "theme-wednesday": "bg-purple-500",
  "theme-thursday": "bg-orange-500",
  "theme-friday": "bg-red-500",
  "theme-saturday": "bg-cyan-500",
};

const ThemeToggle = () => {
  const [open, setOpen] = useState(false);
  const { theme, setTheme, isOverridden, THEME_CLASSES, THEME_LABELS } = useDailyTheme();

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute bottom-16 left-0 glass-white rounded-2xl p-3 shadow-xl min-w-[200px]"
          >
            <div className="text-xs font-semibold text-muted-foreground mb-2 px-1">Tema Harian</div>
            <div className="space-y-1">
              {THEME_CLASSES.map((t, i) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    theme === t ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${colorMap[t]}`} />
                  {THEME_LABELS[i]}
                </button>
              ))}
            </div>
            {isOverridden && (
              <button
                onClick={() => setTheme("auto")}
                className="w-full flex items-center gap-2 px-3 py-2 mt-1 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted transition-all border-t border-border"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Kembali ke Otomatis
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen(!open)}
        className="w-12 h-12 rounded-full gradient-blue flex items-center justify-center shadow-blue-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Ganti tema warna"
      >
        {open ? <X className="h-5 w-5 text-primary-foreground" /> : <Palette className="h-5 w-5 text-primary-foreground" />}
      </motion.button>
    </div>
  );
};

export default ThemeToggle;
