import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

export function buttonClasses(variant: ButtonVariant = "primary") {
  return cn(
    "inline-flex min-h-11 w-full items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold tracking-wide transition-all duration-300 sm:w-auto",
    "focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-surface",
    variant === "primary" &&
      "bg-gradient-to-r from-accent to-accent-violet text-white shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 hover:brightness-110 active:scale-[0.98] disabled:opacity-40",
    variant === "secondary" &&
      "border border-white/[0.1] bg-white/[0.04] text-content hover:bg-white/[0.08] hover:border-white/[0.15] active:scale-[0.98]",
    variant === "ghost" &&
      "text-content-secondary hover:text-content hover:bg-white/[0.06]",
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return <button className={cn(buttonClasses(variant), className)} {...props} />;
}
