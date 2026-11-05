import React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showText?: boolean;
  className?: string;
  barClassName?: string;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showText = false,
  className,
  barClassName,
}: ProgressBarProps) {
  const safeMax = max > 0 ? max : 100;
  const percentage = Math.min(Math.max(Math.round((value / safeMax) * 100), 0), 100);

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {(label || showText) && (
        <div className="flex items-center justify-between text-xs font-medium text-slate-600">
          {label && <span>{label}</span>}
          {showText && <span>{percentage}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-label={label || "Tiến độ"}
        className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200"
      >
        <div
          className={cn(
            "h-full rounded-full bg-primary transition-all duration-300 ease-out",
            barClassName
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

