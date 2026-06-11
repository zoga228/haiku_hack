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
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        variant === "default" &&
          "border border-white/70 bg-white/35 text-content-secondary",
        variant === "success" &&
          "border border-success/20 bg-success/10 text-success",
        variant === "accent" &&
          "border border-accent/20 bg-accent/10 text-accent-dark",
        variant === "outline" &&
          "border border-white/70 text-content-secondary",
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
