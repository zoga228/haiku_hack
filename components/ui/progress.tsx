import { cn } from "@/lib/utils";

type ProgressProps = {
  value: number;
  className?: string;
  variant?: "default" | "success";
};

export function Progress({ value, className, variant = "default" }: ProgressProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <div
      className={cn("h-2 overflow-hidden rounded-full bg-white/[0.06]", className)}
      aria-label={`${Math.round(clampedValue)}% complete`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clampedValue}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-500",
          variant === "default" && "bg-gradient-to-r from-accent to-accent-violet",
          variant === "success" && "bg-gradient-to-r from-success to-success-light",
        )}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
}
