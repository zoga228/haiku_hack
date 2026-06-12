import { useAuth } from "@/_core/hooks/useAuth";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Coins,
  LogIn,
  LogOut,
  ShoppingBag,
  UserPlus,
  Wallet,
  Sparkles,
  Zap, ShoppingCart,
} from "lucide-react";
import { toast } from "sonner";

// ─── NAV SECTIONS ──────────────────────────────────────────────────────────────

const navSections = [
  { label: "Каталог", icon: ShoppingBag, href: "/catalog" },
  { label: "Swipeee", icon: Zap, href: "/swipe" },
  { label: "Coin AI", icon: Sparkles, href: "/coin-ai" },
  { label: "Кошелёк", icon: Wallet, href: "/wallet" },
  { label: "Друзья", icon: UserPlus, href: "/friends" },
  { label: "Coins", icon: Coins, href: "/coins" },
  { label: "Корзина", icon: ShoppingCart, href: "/cart" },
];

// ─── HOME PAGE ─────────────────────────────────────────────────────────────────

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();

  const handleNavClick = (label: string) => {
    toast(`${label} — скоро`, {
      description: "Эта страница находится в разработке.",
      duration: 2500,
    });
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* ── Full-screen sky background ── */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage:
            "url('https://d2xsxph8kpxj0f.cloudfront.net/310519663752008614/CQve3qqPzggvAYmAyEarNa/hero-sky-clouds-1-mUDo6fjZmSX72K8BGGyxrk.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      {/* Subtle overlay for text legibility */}
      <div className="fixed inset-0 z-[1] bg-gradient-to-b from-sky-900/20 via-transparent to-sky-900/10" />

      {/* ── Navigation ── */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-50 w-full"
      >
        <div className="w-full px-6 h-16 flex items-center justify-between">
          {/* Logo — far left */}
          <a href="/" className="flex items-center gap-3 shrink-0">
            <svg viewBox="0 0 256 256" className="w-8 h-8" fill="white">
              <path d="M 0 128 C 70.692 128 128 185.308 128 256 L 64 256 C 64 220.654 35.346 192 0 192 Z M 256 192 C 220.654 192 192 220.654 192 256 L 128 256 C 128 185.308 185.308 128 256 128 Z M 128 0 C 128 70.692 70.692 128 0 128 L 0 64 C 35.346 64 64 35.346 64 0 Z M 192 0 C 192 35.346 220.654 64 256 64 L 256 128 C 185.308 128 128 70.692 128 0 Z" />
            </svg>
            <span className="text-white font-semibold text-lg tracking-tight">CoiNIS</span>
          </a>

          {/* Section links — center */}
          <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            {navSections.map((section, i) => (
              <motion.button
                key={section.label}
                onClick={() => section.href ? (window.location.href = section.href) : handleNavClick(section.label)}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05, duration: 0.5 }}
                className="flex items-center gap-1.5 text-white/75 text-sm font-medium hover:text-white transition-colors px-3 py-1.5 rounded-full hover:bg-white/10 cursor-pointer"
              >
                <section.icon className="w-3.5 h-3.5" />
                {section.label}
              </motion.button>
            ))}
          </div>

          {/* Auth — far right */}
          <div className="flex items-center gap-2 shrink-0">
            {isAuthenticated ? (
              <>
                <span className="hidden sm:block text-white/70 text-sm font-medium">
                  {user?.name}
                </span>
                <motion.button
                  onClick={logout}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 font-medium text-sm px-4 py-2 transition-all hover:bg-white/20 active:scale-[0.98]"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Выйти
                </motion.button>
              </>
            ) : (
              <>
                <motion.a
                  href="/sign-in"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="inline-flex items-center gap-1.5 text-white/80 font-medium text-sm px-4 py-2 rounded-full hover:bg-white/10 transition-all cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Войти
                </motion.a>
                <motion.a
                  href="/register"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-white text-black font-medium text-sm px-5 py-2.5 transition-all hover:bg-white/90 active:scale-[0.98] cursor-pointer"
                >
                  Get Started
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-[1px]" />
                </motion.a>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* ── Hero Content ── */}
      <div className="relative z-10 min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center px-6">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl md:text-8xl font-semibold tracking-tight leading-[0.9] text-white"
        >
          Shop Together.
          <br />
          <span className="text-white">Save More.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 text-white/70 max-w-lg text-base md:text-lg leading-[1.5]"
        >
          CoiNIS — платформа коллективных покупок. ИИ подбирает товары и открывает оптовые цены через групповые заказы.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex flex-col items-center gap-3"
        >
          <a
            href="/register"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-white text-black font-medium text-sm px-6 py-3.5 transition-all hover:bg-white/90 active:scale-[0.98] shadow-lg shadow-black/10 cursor-pointer"
          >
            Начать экономить
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-[1px]" />
          </a>
          <span className="text-xs text-white/40">Бесплатно · Без карты</span>
        </motion.div>
      </div>
    </div>
  );
}
