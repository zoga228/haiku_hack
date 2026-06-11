import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.06] bg-surface-card p-5 sm:p-6 transition-all duration-300",
        className,
      )}
      {...props}
    />
  );
}
