import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Sun, Moon, Monitor, CalendarDays, PartyPopper } from "lucide-react";
import { useThemeSystem, type ThemeMode } from "@/hooks/useThemeSystem";
import { Switch } from "@/components/ui/switch";

const modeOptions: { value: ThemeMode; label: string; icon: typeof Sun; desc: string }[] = [
  { value: "default", label: "Default (Biru)", icon: Monitor, desc: "Warna biru branding utama" },
  { value: "dark", label: "Dark Mode", icon: Moon, desc: "Tampilan gelap nyaman di mata" },
  { value: "light", label: "Light Mode", icon: Sun, desc: "Tampilan terang dan bersih" },
  { value: "daily", label: "Auto Harian", icon: CalendarDays, desc: "Warna berubah tiap hari" },
];

const ThemeSettings = () => {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { mode, setMode, eventEnabled, setEventEnabled, activeEvent, EVENTS } = useThemeSystem();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={panelRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors relative"
        aria-label="Theme Settings"
        title="Theme Settings"
      >
        <Palette className="h-4 w-4" />
        {activeEvent && eventEnabled && (
          <span className="absolute -top-0.5 -right-0.5 text-[8px] leading-none">
            {activeEvent.emoji}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-3 w-72 sm:w-80 bg-card border border-border rounded-2xl shadow-blue-lg overflow-hidden z-50"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border bg-muted/30">
              <h3 className="text-sm font-display font-bold text-foreground flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                Theme Settings
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Pilih tampilan website</p>
            </div>

            {/* Theme modes */}
            <div className="p-3 space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-2 mb-1.5">
                Mode Tampilan
              </p>
              {modeOptions.map((opt) => {
                const active = mode === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setMode(opt.value)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                      active
                        ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                        : "text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      active ? "gradient-blue" : "bg-muted"
                    }`}>
                      <opt.icon className={`h-4 w-4 ${active ? "text-primary-foreground" : "text-muted-foreground"}`} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-semibold block">{opt.label}</span>
                      <span className="text-[10px] text-muted-foreground">{opt.desc}</span>
                    </div>
                    {active && <span className="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Event Theme Toggle */}
            <div className="px-3 pb-3">
              <div className="border border-border rounded-xl p-3 bg-muted/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <PartyPopper className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold text-foreground">Event Theme</span>
                  </div>
                  <Switch checked={eventEnabled} onCheckedChange={setEventEnabled} />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {eventEnabled ? "Tema otomatis berubah saat hari besar" : "Tema event dinonaktifkan"}
                </p>

                {activeEvent && eventEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20"
                  >
                    <p className="text-xs font-semibold text-primary flex items-center gap-1.5">
                      {activeEvent.emoji} {activeEvent.label}
                    </p>
                    <p className="text-[10px] text-primary/70">Tema event sedang aktif!</p>
                  </motion.div>
                )}

                {eventEnabled && !activeEvent && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {EVENTS.map((ev) => (
                      <span key={ev.id} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground" title={ev.label}>
                        {ev.emoji}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeSettings;
