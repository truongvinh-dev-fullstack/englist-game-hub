import React from "react";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface QuestionPromptProps {
  prompt: string;
  subPrompt?: string;
  difficulty?: string;
  skill?: string;
  conceptTags?: string[];
  className?: string;
}

export function QuestionPrompt({
  prompt,
  subPrompt,
  difficulty,
  skill,
  conceptTags = [],
  className,
}: QuestionPromptProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Badges / Meta */}
      <div className="flex flex-wrap items-center gap-2">
        {difficulty && (
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            {difficulty}
          </span>
        )}
        {skill && (
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
            {skill}
          </span>
        )}
        {conceptTags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] text-slate-500 border border-slate-100"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Main Prompt Text */}
      <div className="space-y-1">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-snug">
          {prompt}
        </h2>
        {subPrompt && (
          <p className="text-xs sm:text-sm text-muted flex items-start gap-1.5 pt-0.5">
            <HelpCircle className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" aria-hidden="true" />
            <span>{subPrompt}</span>
          </p>
        )}
      </div>
    </div>
  );
}

