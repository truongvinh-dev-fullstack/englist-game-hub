import React from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface XPBadgeProps {
  xp: number;
  className?: string;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

export function XPBadge({
  xp,
  className,
  showIcon = true,
  size = "md",
}: XPBadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-2.5 py-1 text-sm gap-1.5",
    lg: "px-3.5 py-1.5 text-base gap-2",
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-bold rounded-full bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-800 border border-amber-300 shadow-sm",
        sizeClasses[size],
        className
      )}
      aria-label={`${xp} kinh nghiệm (XP)`}
    >
      {showIcon && (
        <Sparkles
          size={iconSizes[size]}
          className="text-amber-500 fill-amber-400 shrink-0"
          aria-hidden="true"
        />
      )}
      <span>{xp.toLocaleString("vi-VN")} XP</span>
    </span>
  );
}

