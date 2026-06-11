import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

export function buttonClasses(variant: ButtonVariant = "primary") {
  return cn(
    "inline-flex min-h-11 w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold tracking-normal transition-all duration-150 sm:w-auto",
    "focus:outline-none focus:ring-2 focus:ring-accent/30 focus:ring-offset-2 focus:ring-offset-white disabled:pointer-events-none disabled:opacity-45",
    variant === "primary" &&
      "border border-white bg-white text-content shadow-[0_12px_30px_rgba(23,32,51,0.12)] hover:bg-white/90 active:scale-[0.98]",
    variant === "secondary" &&
      "border border-white/70 bg-white/35 text-content backdrop-blur hover:bg-white/60 active:scale-[0.98]",
    variant === "ghost" &&
      "text-content-secondary hover:bg-white/35 hover:text-content",
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
