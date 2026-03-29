import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Ship, Clock, HelpCircle, Volume2, VolumeX, Palette, RotateCcw } from "lucide-react";
import logoImg from "@/assets/logo-mrexpress.png";
import { useMusicContext } from "@/contexts/MusicContext";
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

const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const mainLinks = [
  { to: "/", label: "Beranda" },
  { to: "/tentang", label: "Tentang Kami" },
  { to: "/layanan", label: "Layanan" },
  { to: "/kontak", label: "Kontak" },
];

const dropdownItems = [
  { to: "/faq", label: "FAQ", desc: "Pertanyaan umum", icon: HelpCircle },
  { to: "/cara-kirim-barang-pelni", label: "Cara Kirim Barang", desc: "Panduan via kapal Pelni", icon: Ship },
  { to: "/estimasi-pengiriman-surabaya-papua", label: "Estimasi Pengiriman", desc: "Waktu & rute ke Papua", icon: Clock },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);
  const { isPlaying, isMuted, toggleMute } = useMusicContext();
  const { theme, setTheme, isOverridden, THEME_CLASSES, THEME_LABELS } = useDailyTheme();
  const dayIndex = new Date().getDay();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
    setMobileDropdownOpen(false);
    setThemeOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setThemeOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isDropdownActive = dropdownItems.some((item) => location.pathname === item.to);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.12)] border-primary/10 py-2.5"
          : "bg-gradient-to-r from-background via-background to-primary/5 border-transparent py-3"
      }`}
    >
      <div className="container flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group pl-1">
          <img
            src={logoImg}
            alt="CV MR Express"
            className={`w-auto object-contain transition-all duration-300 group-hover:scale-105 ${
              scrolled ? "h-10 md:h-12" : "h-12 md:h-14 lg:h-16"
            }`}
            style={{ filter: "drop-shadow(0 2px 8px hsl(200 85% 45% / 0.3))", maxWidth: "180px" }}
          />
          <div className="flex flex-col leading-tight">
            <span className={`font-bold transition-all duration-300 ${scrolled ? "text-base md:text-lg" : "text-lg md:text-xl lg:text-[22px]"}`}>
              <span className="text-foreground">CV </span>
              <span className="text-red-500">MR</span>
              <span className="text-primary"> EXPRESS</span>
            </span>
            <span className={`text-muted-foreground transition-all duration-300 ${scrolled ? "text-[10px] md:text-xs" : "text-xs md:text-sm"}`}>
              Agen Pelni Surabaya
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-7">
          {mainLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium transition-colors duration-200 hover:text-primary ${
                location.pathname === link.to ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`text-sm font-medium transition-colors duration-200 hover:text-primary flex items-center gap-1 ${
                isDropdownActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Lainnya
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-3 w-72 glass-white rounded-2xl shadow-blue-lg overflow-hidden border border-border/50 p-2"
                >
                  {dropdownItems.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`flex items-start gap-3 px-4 py-3 rounded-xl transition-colors ${
                        location.pathname === item.to
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted/50 text-foreground"
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl gradient-blue flex items-center justify-center shrink-0 mt-0.5">
                        <item.icon className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div>
                        <span className="font-semibold text-sm block">{item.label}</span>
                        <span className="text-xs text-muted-foreground">{item.desc}</span>
                      </div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme picker */}
          <div className="relative" ref={themeRef}>
            <motion.button
              onClick={() => setThemeOpen(!themeOpen)}
              initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
              className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              aria-label="Ganti tema warna"
              title={`Tema: ${DAY_NAMES[dayIndex]}`}
              whileHover={{ rotate: 20 }}
              whileTap={{ scale: 0.9 }}
            >
              <Palette className="h-4 w-4" />
            </motion.button>
            <AnimatePresence>
              {themeOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-3 w-56 glass-white rounded-2xl shadow-blue-lg overflow-hidden border border-border/50 p-2"
                >
                  <div className="text-xs font-semibold text-muted-foreground mb-2 px-2">Tema Harian</div>
                  {THEME_CLASSES.map((t, i) => (
                    <button
                      key={t}
                      onClick={() => { setTheme(t); setThemeOpen(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        theme === t ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full shrink-0 ${colorMap[t]}`} />
                      {THEME_LABELS[i]}
                    </button>
                  ))}
                  {isOverridden && (
                    <button
                      onClick={() => { setTheme("auto"); setThemeOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 mt-1 rounded-xl text-xs font-medium text-muted-foreground hover:bg-muted transition-all border-t border-border"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Kembali ke Otomatis
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={toggleMute}
            className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            aria-label={isMuted ? "Unmute musik" : "Mute musik"}
            title={isMuted ? "Unmute musik" : "Mute musik"}
          >
            {isMuted || !isPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>

          <a
            href="https://wa.me/6282336829960"
            target="_blank"
            rel="noopener noreferrer"
            className="gradient-blue text-primary-foreground px-6 py-2.5 rounded-2xl text-sm font-semibold hover-lift"
          >
            Hubungi Kami
          </a>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <button
            onClick={() => setThemeOpen(!themeOpen)}
            className="p-2 text-muted-foreground hover:text-primary transition-colors"
            aria-label="Ganti tema"
          >
            <Palette className="h-5 w-5" />
          </button>
          <button
            onClick={toggleMute}
            className="p-2 text-muted-foreground hover:text-primary transition-colors"
            aria-label={isMuted ? "Unmute musik" : "Mute musik"}
          >
            {isMuted || !isPlaying ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-foreground"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-white mt-2 mx-4 rounded-3xl overflow-hidden"
          >
            <div className="p-5 flex flex-col gap-2">
              {mainLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-medium py-2.5 px-4 rounded-xl transition-colors ${
                    location.pathname === link.to
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Mobile dropdown */}
              <button
                onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
                className={`text-sm font-medium py-2.5 px-4 rounded-xl transition-colors flex items-center justify-between ${
                  isDropdownActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Lainnya
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${mobileDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {mobileDropdownOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden pl-4 flex flex-col gap-1"
                  >
                    {dropdownItems.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={`flex items-center gap-3 text-sm py-2.5 px-4 rounded-xl transition-colors ${
                          location.pathname === item.to
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <a
                href="https://wa.me/6282336829960"
                target="_blank"
                rel="noopener noreferrer"
                className="gradient-blue text-primary-foreground px-5 py-3 rounded-2xl text-sm font-semibold text-center mt-2"
              >
                Hubungi Kami
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;