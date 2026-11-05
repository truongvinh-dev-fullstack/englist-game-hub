import React from "react";
import Link from "next/link";
import { Clock, BarChart } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GameCardProps {
  slug: string;
  title: string;
  description: string;
  skill: "Từ vựng" | "Ngữ pháp" | "Luyện nghe" | "Giao tiếp";
  difficulty: "A0" | "A1" | "A2" | "B1";
  duration: string;
  icon: React.ReactNode;
  badgeColor?: string;
  className?: string;
}

export function GameCard({
  slug,
  title,
  description,
  skill,
  difficulty,
  duration,
  icon,
  className,
}: GameCardProps) {
  const skillColorMap: Record<string, string> = {
    "Từ vựng": "bg-blue-50 text-blue-700 border-blue-200/60",
    "Ngữ pháp": "bg-purple-50 text-purple-700 border-purple-200/60",
    "Luyện nghe": "bg-teal-50 text-teal-700 border-teal-200/60",
    "Giao tiếp": "bg-amber-50 text-amber-700 border-amber-200/60",
  };

  return (
    <Link
      href={`/games/${slug}`}
      className={cn(
        "group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-surface p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 focus-visible:outline-2 focus-visible:outline-primary",
        className
      )}
    >
      <div>
        {/* Card Header: Icon + Skill Badge */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-800 border border-slate-100 group-hover:bg-blue-50 group-hover:text-primary transition-colors">
            {icon}
          </div>
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
              skillColorMap[skill] || "bg-slate-100 text-slate-700"
            )}
          >
            {skill}
          </span>
        </div>

        {/* Title & Description */}
        <h3 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="mt-1 text-xs text-muted line-clamp-2 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Card Footer: Meta Info (Level & Duration) */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
        <span className="inline-flex items-center gap-1">
          <BarChart className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{difficulty}</span>
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{duration}</span>
        </span>
      </div>
    </Link>
  );
}

