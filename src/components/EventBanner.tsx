import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useThemeSystem, type EventInfo } from "@/hooks/useThemeSystem";

// ─── Greeting messages per event ───
const EVENT_GREETINGS: Record<string, { greeting: string; sub: string }> = {
  "event-ramadhan": {
    greeting: "Selamat Menjalankan Ibadah Puasa 🌙",
    sub: "Ramadhan Kareem! Semoga penuh berkah.",
  },
  "event-idul-fitri": {
    greeting: "Selamat Hari Raya Idul Fitri 🕌",
    sub: "Mohon Maaf Lahir dan Batin 1446 H",
  },
  "event-idul-adha": {
    greeting: "Selamat Hari Raya Idul Adha 🐑",
    sub: "Semoga amal ibadah kita diterima.",
  },
  "event-maulid-nabi": {
    greeting: "Selamat Memperingati Maulid Nabi ✨",
    sub: "Muhammad SAW, suri tauladan umat.",
  },
  "event-isra-miraj": {
    greeting: "Selamat Memperingati Isra Mi'raj 🌟",
    sub: "Perjalanan suci Nabi Muhammad SAW.",
  },
  "event-tahun-baru-islam": {
    greeting: "Selamat Tahun Baru Islam 📿",
    sub: "Semoga tahun ini penuh keberkahan.",
  },
  "event-17-agustus": {
    greeting: "Dirgahayu Republik Indonesia! 🇮🇩",
    sub: "Merdeka! Jayalah Indonesiaku.",
  },
  "event-hari-pahlawan": {
    greeting: "Selamat Hari Pahlawan 🎖️",
    sub: "Jasamu tak akan pernah kami lupakan.",
  },
  "event-hari-santri": {
    greeting: "Selamat Hari Santri Nasional 📖",
    sub: "Santri sehat, Indonesia kuat.",
  },
  "event-tahun-baru": {
    greeting: "Selamat Tahun Baru! 🎆",
    sub: "Semoga tahun baru penuh kebahagiaan.",
  },
};

// ─── Confetti particle ───
interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  delay: number;
  duration: number;
  shape: "square" | "circle" | "triangle";
}

const CONFETTI_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(0 80% 60%)",
  "hsl(45 95% 55%)",
  "hsl(280 70% 60%)",
  "hsl(150 70% 50%)",
  "hsl(30 90% 55%)",
  "hsl(200 80% 60%)",
];

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: -10 - Math.random() * 20,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 6 + Math.random() * 8,
    rotation: Math.random() * 360,
    delay: Math.random() * 2,
    duration: 2.5 + Math.random() * 2,
    shape: (["square", "circle", "triangle"] as const)[Math.floor(Math.random() * 3)],
  }));
}

const ConfettiParticle = ({ particle }: { particle: Particle }) => {
  const shapeStyle: React.CSSProperties = {
    position: "absolute",
    left: `${particle.x}%`,
    width: particle.size,
    height: particle.size,
    backgroundColor: particle.shape !== "triangle" ? particle.color : "transparent",
    borderRadius: particle.shape === "circle" ? "50%" : particle.shape === "square" ? "2px" : "0",
    ...(particle.shape === "triangle" && {
      width: 0,
      height: 0,
      borderLeft: `${particle.size / 2}px solid transparent`,
      borderRight: `${particle.size / 2}px solid transparent`,
      borderBottom: `${particle.size}px solid ${particle.color}`,
      backgroundColor: "transparent",
    }),
  };

  return (
    <motion.div
      style={shapeStyle}
      initial={{
        y: particle.y,
        rotate: particle.rotation,
        opacity: 1,
      }}
      animate={{
        y: "120vh",
        rotate: particle.rotation + 720,
        opacity: [1, 1, 0.8, 0],
        x: [0, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 60],
      }}
      transition={{
        duration: particle.duration,
        delay: particle.delay,
        ease: "easeIn",
        repeat: Infinity,
        repeatDelay: Math.random() * 3,
      }}
    />
  );
};

// ─── Banner Component ───
const EventBanner = () => {
  const { activeEvent, eventEnabled } = useThemeSystem();
  const [dismissed, setDismissed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const particles = useMemo(() => generateParticles(40), []);

  const isActive = eventEnabled && activeEvent && !dismissed;

  useEffect(() => {
    if (isActive) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  if (!isActive || !activeEvent) return null;

  const greetingData = EVENT_GREETINGS[activeEvent.id] ?? {
    greeting: `${activeEvent.emoji} ${activeEvent.label}`,
    sub: "Selamat merayakan!",
  };

  return (
    <>
      {/* Confetti overlay */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            className="absolute inset-0 z-[5] pointer-events-none overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {particles.map((p) => (
              <ConfettiParticle key={p.id} particle={p} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Greeting banner */}
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="absolute top-20 sm:top-24 left-1/2 -translate-x-1/2 z-[6] w-[90%] max-w-lg"
      >
        <div
          className="relative rounded-2xl border border-white/20 px-5 py-4 sm:px-6 sm:py-5 text-center overflow-hidden"
          style={{
            background: "linear-gradient(135deg, hsl(var(--primary) / 0.25) 0%, hsl(var(--accent) / 0.2) 50%, hsl(var(--primary) / 0.3) 100%)",
            backdropFilter: "blur(16px)",
            boxShadow: "0 8px 32px hsl(var(--primary) / 0.3), inset 0 1px 0 hsl(0 0% 100% / 0.1)",
          }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(90deg, transparent 0%, hsl(0 0% 100% / 0.08) 50%, transparent 100%)",
            }}
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          />

          {/* Close button */}
          <button
            onClick={() => setDismissed(true)}
            className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Tutup banner"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Emoji */}
          <motion.div
            className="text-3xl sm:text-4xl mb-2"
            animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {activeEvent.emoji}
          </motion.div>

          {/* Greeting text */}
          <motion.h2
            className="text-base sm:text-lg font-display font-bold text-white drop-shadow-lg"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {greetingData.greeting}
          </motion.h2>
          <motion.p
            className="text-xs sm:text-sm text-white/70 mt-1 font-body"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {greetingData.sub}
          </motion.p>

          {/* Decorative dots */}
          <div className="flex justify-center gap-1.5 mt-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-white/30"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default EventBanner;
