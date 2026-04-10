import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useThemeSystemContext } from "@/contexts/ThemeSystemContext";
import type { EventTheme } from "@/hooks/useThemeSystem";

// ─── Duration for animations (ms) ───
const ANIM_DURATION = 12000;

// ─── Particle base ───
interface BaseParticle {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
}

function makeParticles(count: number): BaseParticle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 4,
    duration: 3 + Math.random() * 3,
    size: 8 + Math.random() * 16,
  }));
}

// ══════════════════════════════════════
//  1. Isra Mi'raj — Hujan bintang ⭐
// ══════════════════════════════════════
const StarRain = ({ particles }: { particles: BaseParticle[] }) => (
  <>
    {particles.map((p) => (
      <motion.div
        key={p.id}
        className="absolute pointer-events-none"
        style={{ left: `${p.x}%`, top: -20, fontSize: p.size }}
        initial={{ y: -30, opacity: 0, rotate: 0 }}
        animate={{
          y: "110vh",
          opacity: [0, 1, 1, 0.6, 0],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: p.duration,
          delay: p.delay,
          repeat: Infinity,
          repeatDelay: Math.random() * 2,
          ease: "linear",
        }}
      >
        ⭐
      </motion.div>
    ))}
    {/* Shooting stars */}
    {[0, 1, 2].map((i) => (
      <motion.div
        key={`shoot-${i}`}
        className="absolute pointer-events-none"
        style={{
          top: `${10 + i * 25}%`,
          left: "-5%",
          width: 60,
          height: 2,
          background: "linear-gradient(90deg, transparent, hsl(45 100% 70%), hsl(45 100% 90%), transparent)",
          borderRadius: 4,
          boxShadow: "0 0 12px hsl(45 100% 70% / 0.6)",
        }}
        animate={{
          x: ["0vw", "120vw"],
          y: [0, 80],
          opacity: [0, 1, 1, 0],
        }}
        transition={{
          duration: 1.8,
          delay: 1.5 + i * 3,
          repeat: Infinity,
          repeatDelay: 5 + i * 2,
          ease: "easeIn",
        }}
      />
    ))}
  </>
);

// ══════════════════════════════════════
//  2. 17 Agustus — Bendera berkibar 🇮🇩
// ══════════════════════════════════════
const FlagWave = () => {
  const flags = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: 5 + i * 12 + Math.random() * 4,
      delay: i * 0.3,
      size: 28 + Math.random() * 16,
    })), []);

  return (
    <>
      {flags.map((f) => (
        <motion.div
          key={f.id}
          className="absolute pointer-events-none"
          style={{ left: `${f.x}%`, top: -10, fontSize: f.size }}
          initial={{ y: -40, opacity: 0 }}
          animate={{
            y: "115vh",
            opacity: [0, 1, 1, 0.5, 0],
            rotate: [0, -15, 15, -10, 10, 0],
            scale: [1, 1.1, 0.95, 1.05, 1],
          }}
          transition={{
            duration: 5 + Math.random() * 2,
            delay: f.delay,
            repeat: Infinity,
            repeatDelay: 1 + Math.random() * 2,
            ease: "easeInOut",
          }}
        >
          🇮🇩
        </motion.div>
      ))}
      {/* Red-white ribbons */}
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={`ribbon-${i}`}
          className="absolute pointer-events-none rounded-full"
          style={{
            left: `${15 + i * 22}%`,
            top: -20,
            width: 6,
            height: 40,
            background: i % 2 === 0
              ? "linear-gradient(180deg, #ff0000, #ff0000 50%, #ffffff 50%)"
              : "linear-gradient(180deg, #ffffff, #ffffff 50%, #ff0000 50%)",
            borderRadius: 3,
          }}
          animate={{
            y: ["0vh", "110vh"],
            rotate: [-30, 30, -20, 25, -15],
            opacity: [0, 1, 1, 0.6, 0],
          }}
          transition={{
            duration: 4.5,
            delay: 0.5 + i * 1.2,
            repeat: Infinity,
            repeatDelay: 3,
            ease: "easeIn",
          }}
        />
      ))}
    </>
  );
};

// ══════════════════════════════════════
//  3. Ramadhan — Bulan sabit & bintang 🌙
// ══════════════════════════════════════
const CrescentRain = ({ particles }: { particles: BaseParticle[] }) => (
  <>
    {particles.map((p) => (
      <motion.div
        key={p.id}
        className="absolute pointer-events-none"
        style={{ left: `${p.x}%`, top: -20, fontSize: p.size * 0.8 }}
        initial={{ y: -20, opacity: 0 }}
        animate={{
          y: "110vh",
          opacity: [0, 0.9, 0.8, 0.3, 0],
          rotate: [0, 30, -20, 15],
        }}
        transition={{
          duration: p.duration + 1,
          delay: p.delay,
          repeat: Infinity,
          repeatDelay: Math.random() * 3,
          ease: "easeIn",
        }}
      >
        {p.id % 3 === 0 ? "🌙" : p.id % 3 === 1 ? "✨" : "⭐"}
      </motion.div>
    ))}
  </>
);

// ══════════════════════════════════════
//  4. Idul Fitri — Ketupat & confetti 🕌
// ══════════════════════════════════════
const KetupatRain = ({ particles }: { particles: BaseParticle[] }) => {
  const emojis = ["🕌", "🎊", "🎉", "✨", "💚"];
  return (
    <>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute pointer-events-none"
          style={{ left: `${p.x}%`, top: -20, fontSize: p.size }}
          initial={{ y: -20, opacity: 0 }}
          animate={{
            y: "110vh",
            opacity: [0, 1, 1, 0.5, 0],
            rotate: [0, 90, 180, 270, 360],
            scale: [0.8, 1.2, 1, 1.1, 0.9],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            repeatDelay: Math.random() * 2,
            ease: "easeIn",
          }}
        >
          {emojis[p.id % emojis.length]}
        </motion.div>
      ))}
    </>
  );
};

// ══════════════════════════════════════
//  5. Idul Adha — Domba & dedaunan 🐑
// ══════════════════════════════════════
const SheepRain = ({ particles }: { particles: BaseParticle[] }) => {
  const emojis = ["🐑", "🌿", "🍃", "✨"];
  return (
    <>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute pointer-events-none"
          style={{ left: `${p.x}%`, top: -20, fontSize: p.size * 0.9 }}
          initial={{ y: -20, opacity: 0 }}
          animate={{
            y: "110vh",
            opacity: [0, 0.8, 0.7, 0.3, 0],
            x: [0, (Math.random() - 0.5) * 40],
          }}
          transition={{
            duration: p.duration + 1,
            delay: p.delay,
            repeat: Infinity,
            repeatDelay: Math.random() * 3,
            ease: "easeIn",
          }}
        >
          {emojis[p.id % emojis.length]}
        </motion.div>
      ))}
    </>
  );
};

// ══════════════════════════════════════
//  6. Maulid Nabi — Sparkle rain ✨
// ══════════════════════════════════════
const SparkleRain = ({ particles }: { particles: BaseParticle[] }) => (
  <>
    {particles.map((p) => (
      <motion.div
        key={p.id}
        className="absolute pointer-events-none"
        style={{ left: `${p.x}%`, top: -20, fontSize: p.size }}
        initial={{ y: -20, opacity: 0 }}
        animate={{
          y: "110vh",
          opacity: [0, 1, 0.8, 0.4, 0],
          scale: [0.5, 1.3, 0.8, 1.1, 0.6],
        }}
        transition={{
          duration: p.duration,
          delay: p.delay,
          repeat: Infinity,
          repeatDelay: Math.random() * 2,
          ease: "easeIn",
        }}
      >
        {p.id % 2 === 0 ? "✨" : "🌟"}
      </motion.div>
    ))}
  </>
);

// ══════════════════════════════════════
//  7. Tahun Baru — Kembang api 🎆
// ══════════════════════════════════════
const FireworkRain = ({ particles }: { particles: BaseParticle[] }) => {
  const emojis = ["🎆", "🎇", "✨", "🎉", "🥳"];
  return (
    <>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute pointer-events-none"
          style={{ left: `${p.x}%`, top: -20, fontSize: p.size }}
          initial={{ y: -20, opacity: 0 }}
          animate={{
            y: "110vh",
            opacity: [0, 1, 1, 0.5, 0],
            scale: [0.6, 1.4, 1, 1.2, 0.7],
            rotate: [0, 45, -45, 30, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            repeatDelay: Math.random() * 2,
            ease: "easeIn",
          }}
        >
          {emojis[p.id % emojis.length]}
        </motion.div>
      ))}
    </>
  );
};

// ══════════════════════════════════════
//  8. Hari Pahlawan — Medali & bintang 🎖️
// ══════════════════════════════════════
const MedalRain = ({ particles }: { particles: BaseParticle[] }) => {
  const emojis = ["🎖️", "⭐", "🏅", "✨"];
  return (
    <>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute pointer-events-none"
          style={{ left: `${p.x}%`, top: -20, fontSize: p.size * 0.85 }}
          initial={{ y: -20, opacity: 0 }}
          animate={{
            y: "110vh",
            opacity: [0, 0.9, 0.8, 0.3, 0],
            rotate: [0, 20, -20, 10, 0],
          }}
          transition={{
            duration: p.duration + 0.5,
            delay: p.delay,
            repeat: Infinity,
            repeatDelay: Math.random() * 3,
            ease: "easeIn",
          }}
        >
          {emojis[p.id % emojis.length]}
        </motion.div>
      ))}
    </>
  );
};

// ══════════════════════════════════════
//  9. Hari Santri — Buku & cahaya 📖
// ══════════════════════════════════════
const BookRain = ({ particles }: { particles: BaseParticle[] }) => {
  const emojis = ["📖", "📿", "✨", "🕌"];
  return (
    <>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute pointer-events-none"
          style={{ left: `${p.x}%`, top: -20, fontSize: p.size * 0.8 }}
          initial={{ y: -20, opacity: 0 }}
          animate={{
            y: "110vh",
            opacity: [0, 0.8, 0.7, 0.3, 0],
            x: [0, (Math.random() - 0.5) * 30],
          }}
          transition={{
            duration: p.duration + 1.5,
            delay: p.delay,
            repeat: Infinity,
            repeatDelay: Math.random() * 3,
            ease: "easeIn",
          }}
        >
          {emojis[p.id % emojis.length]}
        </motion.div>
      ))}
    </>
  );
};

// ══════════════════════════════════════
//  10. Tahun Baru Islam — Bulan & tasbih 📿
// ══════════════════════════════════════
const IslamicNewYearRain = ({ particles }: { particles: BaseParticle[] }) => {
  const emojis = ["📿", "🌙", "✨", "🕌"];
  return (
    <>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute pointer-events-none"
          style={{ left: `${p.x}%`, top: -20, fontSize: p.size * 0.85 }}
          initial={{ y: -20, opacity: 0 }}
          animate={{
            y: "110vh",
            opacity: [0, 0.9, 0.7, 0.3, 0],
            rotate: [0, 15, -15, 10, 0],
          }}
          transition={{
            duration: p.duration + 1,
            delay: p.delay,
            repeat: Infinity,
            repeatDelay: Math.random() * 3,
            ease: "easeIn",
          }}
        >
          {emojis[p.id % emojis.length]}
        </motion.div>
      ))}
    </>
  );
};

// ─── Animation selector ───
const EVENT_ANIMATIONS: Record<EventTheme, React.FC<{ particles: BaseParticle[] }>> = {
  "event-isra-miraj": StarRain,
  "event-17-agustus": () => <FlagWave />,
  "event-ramadhan": CrescentRain,
  "event-idul-fitri": KetupatRain,
  "event-idul-adha": SheepRain,
  "event-maulid-nabi": SparkleRain,
  "event-tahun-baru": FireworkRain,
  "event-hari-pahlawan": MedalRain,
  "event-hari-santri": BookRain,
  "event-tahun-baru-islam": IslamicNewYearRain,
};

const EventAnimation = () => {
  const { activeEvent, eventEnabled } = useThemeSystemContext();
  const [visible, setVisible] = useState(false);
  const particles = useMemo(() => makeParticles(20), []);

  const eventId = activeEvent?.id;

  useEffect(() => {
    if (!eventEnabled || !eventId) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), ANIM_DURATION);
    return () => window.clearTimeout(timer);
  }, [eventEnabled, eventId]);

  if (!visible || !eventId) return null;

  const AnimComponent = EVENT_ANIMATIONS[eventId];
  if (!AnimComponent) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] pointer-events-none overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <AnimComponent particles={particles} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EventAnimation;
