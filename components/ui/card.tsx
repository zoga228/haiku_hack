import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "glass-card rounded-lg p-5 shadow-[0_18px_48px_rgba(27,106,164,0.12)] sm:p-6",
        className,
      )}
      {...props}
    />
  );
}
