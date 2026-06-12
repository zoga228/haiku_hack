import { ChevronLeft, Eye, EyeOff, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

/**
 * Registration Page — CoiNIS
 *
 * Design: Cinematic Sky + Liquid Glass
 * Wired to the real emailAuth.register tRPC procedure.
 */

export default function Register() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const registerMutation = trpc.emailAuth.register.useMutation({
    onSuccess: (data) => {
      toast.success(`Welcome to CoiNIS, ${data.name}! You're now signed in.`);
      // Redirect to home — session cookie is already set by the server
      navigate("/");
    },
    onError: (err) => {
      toast.error(err.message ?? "Registration failed. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      toast.error("Please fill in all fields.");
      return;
    }
    registerMutation.mutate({ name: name.trim(), email: email.trim(), password });
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Sky background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage:
            "url('https://d2xsxph8kpxj0f.cloudfront.net/310519663752008614/CQve3qqPzggvAYmAyEarNa/hero-sky-clouds-1-mUDo6fjZmSX72K8BGGyxrk.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-sky-900/20 via-white/60 to-white/90" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
        {/* Back to home */}
        <motion.a
          href="/"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute top-6 left-6 flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to home
        </motion.a>

        {/* Registration Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-2xl shadow-sky-200/30 border border-white/60">
            {/* Logo & Title */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <svg viewBox="0 0 256 256" className="w-8 h-8" fill="#0EA5E9">
                  <path d="M 0 128 C 70.692 128 128 185.308 128 256 L 64 256 C 64 220.654 35.346 192 0 192 Z M 256 192 C 220.654 192 192 220.654 192 256 L 128 256 C 128 185.308 185.308 128 256 128 Z M 128 0 C 128 70.692 70.692 128 0 128 L 0 64 C 35.346 64 64 35.346 64 0 Z M 192 0 C 192 35.346 220.654 64 256 64 L 256 128 C 185.308 128 128 70.692 128 0 Z" />
                </svg>
                <span className="text-xl font-bold text-slate-900">CoiNIS</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                Create your account
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Join thousands of smart shoppers saving together
              </p>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  autoComplete="name"
                  className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold py-3.5 text-sm transition-all hover:shadow-lg hover:shadow-sky-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {registerMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Create Account
                  </>
                )}
              </button>
            </form>

            {/* Terms */}
            <p className="mt-6 text-center text-xs text-slate-400 leading-relaxed">
              By creating an account, you agree to our{" "}
              <a href="#" className="text-sky-500 hover:text-sky-600">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-sky-500 hover:text-sky-600">
                Privacy Policy
              </a>
            </p>
          </div>

          {/* Sign in link */}
          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <a
              href="/sign-in"
              className="text-sky-600 font-medium hover:text-sky-700"
            >
              Sign in
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
