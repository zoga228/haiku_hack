import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  CreditCard,
  Plus,
  Trash2,
  Check,
  Star,
  LogIn,
  Wallet as WalletIcon,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import confetti from "canvas-confetti";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getLoginUrl } from "@/const";

// ─── Sky background (same as landing) ────────────────────────────────────────

const SKY_BG =
  "url('https://d2xsxph8kpxj0f.cloudfront.net/310519663752008614/CQve3qqPzggvAYmAyEarNa/hero-sky-clouds-1-mUDo6fjZmSX72K8BGGyxrk.webp')";

// ─── Subscription plans ───────────────────────────────────────────────────────

const PLANS = [
  {
    id: "explorer" as const,
    name: "Explorer",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: ["Доступ к групповым сделкам", "Базовый кошелёк", "До 5 друзей", "Email поддержка"],
    popular: false,
    cta: "Бесплатно",
  },
  {
    id: "member" as const,
    name: "Member",
    monthlyPrice: 1,
    yearlyPrice: 1,
    features: ["Всё из Explorer", "Приоритетный доступ к сделкам", "До 50 друзей", "5% кэшбэк", "Онлайн-чат"],
    popular: true,
    cta: "Начать экономить",
  },
  {
    id: "business" as const,
    name: "Business",
    monthlyPrice: 1,
    yearlyPrice: 1,
    features: ["Всё из Member", "Безлимит друзей", "10% кэшбэк", "Персональный менеджер", "API доступ"],
    popular: false,
    cta: "Для бизнеса",
  },
];

// ─── Add Card Modal ───────────────────────────────────────────────────────────

function AddCardModal({ onClose }: { onClose: () => void }) {
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const utils = trpc.useUtils();

  const addCard = trpc.wallet.addCard.useMutation({
    onSuccess: () => {
      toast.success("Карта добавлена!");
      utils.wallet.getWallet.invalidate();
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });

  const fmt4 = (v: string) =>
    v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const fmtExp = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length >= 3 ? d.slice(0, 2) + "/" + d.slice(2) : d;
  };

  const brand =
    cardNumber.replace(/\s/g, "")[0] === "4"
      ? "VISA"
      : cardNumber.replace(/\s/g, "")[0] === "5"
      ? "MC"
      : "CARD";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const [m, y] = expiry.split("/");
    addCard.mutate({
      cardNumber: cardNumber.replace(/\s/g, ""),
      cardHolder,
      expMonth: parseInt(m ?? "0"),
      expYear: parseInt("20" + (y ?? "0")),
      cvv,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-slate-900 mb-4">Добавить карту</h2>

        {/* Card preview */}
        <div className="relative h-40 rounded-2xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 p-5 mb-5 overflow-hidden shadow-lg">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <WalletIcon className="w-7 h-7 text-white/80" />
              <span className="text-white/60 text-xs font-bold tracking-widest">{brand}</span>
            </div>
            <div>
              <p className="text-white font-mono text-base tracking-widest">
                {cardNumber || "•••• •••• •••• ••••"}
              </p>
              <div className="flex justify-between mt-1">
                <p className="text-white/70 text-xs uppercase">{cardHolder || "ИМЯ ВЛАДЕЛЬЦА"}</p>
                <p className="text-white/70 text-xs">{expiry || "MM/YY"}</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label className="text-xs font-medium text-slate-600">Номер карты</Label>
            <Input className="mt-1 font-mono text-sm" placeholder="1234 5678 9012 3456"
              value={cardNumber} onChange={(e) => setCardNumber(fmt4(e.target.value))} maxLength={19} required />
          </div>
          <div>
            <Label className="text-xs font-medium text-slate-600">Имя владельца</Label>
            <Input className="mt-1 text-sm" placeholder="Иван Иванов"
              value={cardHolder} onChange={(e) => setCardHolder(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium text-slate-600">Срок</Label>
              <Input className="mt-1 font-mono text-sm" placeholder="MM/YY"
                value={expiry} onChange={(e) => setExpiry(fmtExp(e.target.value))} maxLength={5} required />
            </div>
            <div>
              <Label className="text-xs font-medium text-slate-600">CVV</Label>
              <Input className="mt-1 font-mono text-sm" placeholder="•••" type="password"
                value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))} maxLength={4} required />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1 text-sm" onClick={onClose}>Отмена</Button>
            <Button type="submit" className="flex-1 text-sm bg-sky-500 hover:bg-sky-600 text-white border-0"
              disabled={addCard.isPending}>
              {addCard.isPending ? "Сохраняем..." : "Добавить"}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Wallet Page ─────────────────────────────────────────────────────────

export default function Wallet() {
  const { isAuthenticated, loading, user } = useAuth();
  const [showAddCard, setShowAddCard] = useState(false);
  const [isYearly, setIsYearly] = useState(false);
  const switchRef = useRef<HTMLButtonElement>(null);
  const utils = trpc.useUtils();

  // Handle Stripe redirect back from Checkout
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    const plan = params.get("plan");
    if (payment === "success" && plan) {
      toast.success(`Спасибо! Подписка ${plan.charAt(0).toUpperCase() + plan.slice(1)} активирована — оплата прошла успешно!`);
      utils.wallet.getWallet.invalidate();
      utils.wallet.getTransactions.invalidate();
      // Clean up URL
      window.history.replaceState({}, "", "/wallet");
    } else if (payment === "cancelled") {
      toast.info("Оплата отменена.");
      window.history.replaceState({}, "", "/wallet");
    }
  }, []);

  const { data, isLoading } = trpc.wallet.getWallet.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: transactions, isLoading: txLoading } = trpc.wallet.getTransactions.useQuery(
    { limit: 10 },
    { enabled: isAuthenticated }
  );

  const removeCard = trpc.wallet.removeCard.useMutation({
    onSuccess: () => { toast.success("Карта удалена"); utils.wallet.getWallet.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const purchaseSub = trpc.wallet.purchaseSubscription.useMutation({
    onSuccess: (r) => {
      if (r.checkoutUrl) {
        // Redirect to Stripe Checkout for real payment
        window.location.href = r.checkoutUrl;
      } else {
        toast.success("Подписка Explorer активирована!");
        utils.wallet.getWallet.invalidate();
        utils.wallet.getTransactions.invalidate();
      }
    },
    onError: (e) => toast.error(e.message),
  });

  const handleYearlyToggle = (checked: boolean) => {
    setIsYearly(checked);
    if (checked && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { x: (rect.left + rect.width / 2) / window.innerWidth, y: rect.top / window.innerHeight },
        colors: ["#0ea5e9", "#38bdf8", "#bae6fd", "#ffffff"],
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 28,
        shapes: ["circle"],
      });
    }
  };

  const activePlan = data?.subscription?.plan ?? "explorer";
  const balanceDollars = ((data?.wallet?.balanceCents ?? 0) / 100).toFixed(2);

  const txIcon = (type: string) => {
    if (type === "topup") return <ArrowDownLeft className="w-4 h-4 text-emerald-500" />;
    if (type === "refund") return <RefreshCw className="w-4 h-4 text-blue-400" />;
    return <ArrowUpRight className="w-4 h-4 text-rose-400" />;
  };

  // ── Not logged in ──────────────────────────────────────────────────────────
  if (!loading && !isAuthenticated) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center text-center px-6"
        style={{ backgroundImage: SKY_BG, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-sky-900/30" />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 bg-white/20 backdrop-blur-xl rounded-3xl p-10 max-w-sm w-full shadow-2xl border border-white/30"
        >
          <WalletIcon className="w-12 h-12 text-white mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Мой кошелёк</h1>
          <p className="text-white/70 text-sm mb-7">Войдите, чтобы видеть баланс, историю и управлять подписками.</p>
          <div className="flex flex-col gap-3">
            <Button onClick={() => (window.location.href = getLoginUrl())}
              className="bg-white text-sky-700 hover:bg-white/90 font-semibold gap-2">
              <LogIn className="w-4 h-4" /> Войти
            </Button>
            <a href="/" className="text-white/60 text-sm hover:text-white transition-colors">← На главную</a>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ backgroundImage: SKY_BG, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
      {/* Overlay */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-sky-900/25 via-sky-100/40 to-white/95" />

      {/* ── Top Nav ── */}
      <nav className="relative z-50 w-full">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center gap-4">
          <a href="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Назад</span>
          </a>
          <div className="flex items-center gap-2 ml-2">
            <WalletIcon className="w-5 h-5 text-white" />
            <span className="font-semibold text-white text-base">Кошелёк</span>
          </div>
          {user && (
            <span className="ml-auto text-white/60 text-sm hidden sm:block">{user.name}</span>
          )}
        </div>
      </nav>

      {/* ── Content ── */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pb-20 space-y-6 pt-4">

        {/* Balance + Cards row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Balance card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-3xl overflow-hidden p-7 text-white shadow-2xl shadow-black/40" style={{ background: 'linear-gradient(135deg, #1c1c1e 0%, #2c2c2e 40%, #3a3a3c 70%, #48484a 100%)' }}
          >
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/10 blur-3xl" />
            <div className="relative z-10">
              <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-3">Баланс счёта</p>
              {isLoading ? (
                <div className="h-12 w-36 bg-white/20 rounded-xl animate-pulse mb-3" />
              ) : (
                <p className="text-5xl font-bold tabular-nums mb-3">${balanceDollars}</p>
              )}
              <p className="text-white/50 text-xs">USD · CoiNIS Wallet</p>
              {activePlan !== "explorer" && (
                <span className="mt-3 inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full capitalize">
                  {activePlan} план
                </span>
              )}
            </div>
          </motion.div>

          {/* Payment cards */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
                <CreditCard className="w-4 h-4 text-sky-500" /> Карты
              </h3>
              <button
                onClick={() => setShowAddCard(true)}
                className="flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-full transition-colors"
              >
                <Plus className="w-3 h-3" /> Добавить
              </button>
            </div>

            {isLoading ? (
              <div className="space-y-2">
                {[1, 2].map(i => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}
              </div>
            ) : !data?.cards?.length ? (
              <div className="text-center py-6">
                <CreditCard className="w-9 h-9 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">Нет привязанных карт</p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.cards.map(card => (
                  <div key={card.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group">
                    <div className="w-9 h-6 rounded-md bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                      <CreditCard className="w-3.5 h-3.5 text-white/80" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 capitalize">{card.brand} •••• {card.last4}</p>
                      <p className="text-xs text-slate-400">{card.expMonth}/{card.expYear}</p>
                    </div>
                    <button onClick={() => removeCard.mutate({ cardId: card.id })}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-rose-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Spending history */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-lg p-6"
        >
          <h3 className="font-semibold text-slate-800 text-sm mb-4">История трат</h3>

          {txLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-11 bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
          ) : !transactions?.length ? (
            <div className="text-center py-10">
              <RefreshCw className="w-9 h-9 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">Транзакций пока нет</p>
              <p className="text-slate-300 text-xs mt-1">Пополните кошелёк или купите подписку</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {transactions.map(tx => (
                <div key={tx.id} className="flex items-center gap-4 py-3">
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0">
                    {txIcon(tx.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{tx.description}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(tx.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <span className={`text-sm font-semibold tabular-nums ${tx.amountCents > 0 ? "text-emerald-600" : "text-rose-500"}`}>
                    {tx.amountCents > 0 ? "+" : ""}${(Math.abs(tx.amountCents) / 100).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Subscription Plans */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="pb-4"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">Подписки</h2>
            <p className="text-slate-500 text-sm">Разблокируй больше возможностей</p>
          </div>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className={`text-sm font-medium ${!isYearly ? "text-slate-900" : "text-slate-400"}`}>Ежемесячно</span>
            <Label>
              <Switch
                ref={switchRef as React.RefObject<HTMLButtonElement>}
                checked={isYearly}
                onCheckedChange={handleYearlyToggle}
              />
            </Label>
            <span className={`text-sm font-medium ${isYearly ? "text-slate-900" : "text-slate-400"}`}>
              Ежегодно <span className="text-sky-600 font-semibold">(−20%)</span>
            </span>
          </div>

          {/* Plan cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PLANS.map((plan, i) => {
              const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
              const isActive = activePlan === plan.id;

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: plan.popular ? -8 : 0, scale: plan.popular ? 1 : 0.97 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className={`relative rounded-2xl p-6 flex flex-col bg-white/80 backdrop-blur-xl border shadow-lg ${
                    plan.popular
                      ? "border-sky-400 border-2 shadow-sky-200/60"
                      : "border-white/60"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sky-500 text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1 shadow-md">
                      <Star className="w-3 h-3 fill-white" /> Популярный
                    </div>
                  )}
                  {isActive && (
                    <div className="absolute top-3 right-3 bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      Активен
                    </div>
                  )}

                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{plan.name}</p>

                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-4xl font-bold text-slate-900">
                      {price === 0 ? "Free" : `${price}₸`}
                    </span>
                    {price > 0 && (
                      <span className="text-slate-400 text-sm mb-1">/{isYearly ? "год" : "мес"}</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mb-5">
                    {price === 0 ? "Всегда бесплатно" : isYearly ? "при оплате за год" : "при ежемесячной оплате"} {price > 0 && "(KZT)"}
                  </p>

                  <ul className="space-y-2 flex-1 mb-6">
                    {plan.features.map((f, fi) => (
                      <li key={fi} className="flex items-start gap-2 text-sm text-slate-600">
                        <Check className="w-4 h-4 text-sky-500 mt-0.5 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => {
                      if (isActive || plan.id === "explorer") return;
                      purchaseSub.mutate({ plan: plan.id, billingCycle: isYearly ? "yearly" : "monthly", origin: window.location.origin });
                    }}
                    disabled={isActive || plan.id === "explorer" || purchaseSub.isPending}
                    className={`w-full font-semibold text-sm transition-all ${
                      isActive
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default"
                        : plan.popular
                        ? "bg-sky-500 hover:bg-sky-600 text-white border-0"
                        : plan.id === "explorer"
                        ? "bg-slate-50 text-slate-400 border border-slate-200 cursor-default"
                        : "bg-white text-slate-800 border border-slate-200 hover:border-sky-400 hover:text-sky-600"
                    }`}
                    variant="outline"
                  >
                    {isActive ? "Текущий план" : plan.id === "explorer" ? "Ваш план" : plan.cta}
                  </Button>
                </motion.div>
              );
            })}
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            Оплата через кошелёк CoiNIS · Stripe будет добавлен в следующем обновлении
          </p>
        </motion.div>
      </div>

      {/* Add Card Modal */}
      <AnimatePresence>
        {showAddCard && <AddCardModal onClose={() => setShowAddCard(false)} />}
      </AnimatePresence>
    </div>
  );
}
