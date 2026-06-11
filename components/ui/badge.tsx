import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "accent" | "outline";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors",
        variant === "default" &&
          "bg-white/[0.06] text-content-secondary border border-white/[0.06]",
        variant === "success" &&
          "bg-success/10 text-success border border-success/20",
        variant === "accent" &&
          "bg-accent/10 text-accent-light border border-accent/20",
        variant === "outline" &&
          "border border-white/[0.1] text-content-secondary",
        className,
      )}
      {...props}
    />
  );
}

export function MarketplaceBadge({
  marketplace,
  color,
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { marketplace: string; color: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        className,
      )}
      style={{
        backgroundColor: `${color}18`,
        color: color,
        border: `1px solid ${color}30`,
      }}
      {...props}
    >
      {marketplace}
    </span>
  );
}
