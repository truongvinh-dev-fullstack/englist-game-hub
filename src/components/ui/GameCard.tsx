import React from "react";
import Link from "next/link";
import { Clock, BarChart, ArrowRight } from "lucide-react";
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

const GAME_THEME_MAP: Record<
  string,
  {
    borderHover: string;
    iconBg: string;
    accentLine: string;
    skillBadge: string;
    levelBadge: string;
  }
> = {
  "memory-flip": {
    borderHover: "hover:border-indigo-400 hover:shadow-indigo-500/10",
    iconBg: "bg-indigo-50 text-indigo-600 border-indigo-100",
    accentLine: "from-indigo-500 to-purple-600",
    skillBadge: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
    levelBadge: "bg-indigo-100/70 text-indigo-800",
  },
  "sentence-builder": {
    borderHover: "hover:border-blue-400 hover:shadow-blue-500/10",
    iconBg: "bg-blue-50 text-blue-600 border-blue-100",
    accentLine: "from-blue-500 to-cyan-500",
    skillBadge: "bg-blue-50 text-blue-700 border-blue-200/80",
    levelBadge: "bg-blue-100/70 text-blue-800",
  },
  "error-detective": {
    borderHover: "hover:border-emerald-400 hover:shadow-emerald-500/10",
    iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
    accentLine: "from-emerald-500 to-teal-500",
    skillBadge: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    levelBadge: "bg-emerald-100/70 text-emerald-800",
  },
  "listen-choose": {
    borderHover: "hover:border-amber-400 hover:shadow-amber-500/10",
    iconBg: "bg-amber-50 text-amber-600 border-amber-100",
    accentLine: "from-amber-500 to-orange-500",
    skillBadge: "bg-amber-50 text-amber-700 border-amber-200/80",
    levelBadge: "bg-amber-100/70 text-amber-800",
  },
  roleplay: {
    borderHover: "hover:border-rose-400 hover:shadow-rose-500/10",
    iconBg: "bg-rose-50 text-rose-600 border-rose-100",
    accentLine: "from-rose-500 to-pink-500",
    skillBadge: "bg-rose-50 text-rose-700 border-rose-200/80",
    levelBadge: "bg-rose-100/70 text-rose-800",
  },
};

const DEFAULT_THEME = {
  borderHover: "hover:border-primary hover:shadow-primary/10",
  iconBg: "bg-slate-50 text-slate-700 border-slate-100",
  accentLine: "from-blue-600 to-indigo-600",
  skillBadge: "bg-slate-100 text-slate-700 border-slate-200",
  levelBadge: "bg-slate-100 text-slate-800",
};

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
  const theme = GAME_THEME_MAP[slug] || DEFAULT_THEME;

  return (
    <Link
      href={`/games/${slug}`}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-slate-200/90 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-primary",
        theme.borderHover,
        className
      )}
    >
      {/* Top Gradient Accent Ribbon */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r opacity-90 group-hover:h-2 transition-all duration-300",
          theme.accentLine
        )}
      />

      <div>
        {/* Card Header: Icon + Skill Badge */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl border shadow-sm transition-transform duration-300 group-hover:scale-110",
              theme.iconBg
            )}
          >
            {icon}
          </div>
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold shadow-xs",
              theme.skillBadge
            )}
          >
            {skill}
          </span>
        </div>

        {/* Title & Description */}
        <h3 className="text-lg font-black text-slate-900 group-hover:text-primary transition-colors tracking-tight">
          {title}
        </h3>
        <p className="mt-2 text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed font-normal">
          {description}
        </p>
      </div>

      {/* Card Footer: Meta Info & Play Action */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-bold",
              theme.levelBadge
            )}
          >
            <BarChart className="h-3 w-3" aria-hidden="true" />
            <span>{difficulty}</span>
          </span>
          <span className="inline-flex items-center gap-1 text-slate-500">
            <Clock className="h-3 w-3 text-slate-400" aria-hidden="true" />
            <span>{duration}</span>
          </span>
        </div>

        {/* Hover Action Pill */}
        <div className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform duration-200">
          <span>Vào chơi</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </Link>
  );
}
