"use client";

import React, { useEffect, useCallback } from "react";
import { MessageSquare, User, CornerDownLeft, Volume2 } from "lucide-react";
import type { RoleplayPublicPayload } from "@/lib/validations/content/roleplay";
import { cn } from "@/lib/utils";

export interface RoleplayRendererProps {
  payload: RoleplayPublicPayload;
  selectedChoiceId: string | null;
  disabled?: boolean;
  onSelectChoice: (choiceId: string) => void;
  onSubmit: () => void;
}

export function RoleplayRenderer({
  payload,
  selectedChoiceId,
  disabled = false,
  onSelectChoice,
  onSubmit,
}: RoleplayRendererProps) {
  // Optional Web Speech API for NPC dialogue voice preview
  const speakNpcText = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(payload.npcText);
      utterance.lang = "en-US";
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  }, [payload.npcText]);

  // Keyboard shortcut listener: 1-4 for choices, Enter to submit
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (disabled) return;

      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= payload.choices.length) {
        e.preventDefault();
        const target = payload.choices[num - 1];
        if (target) {
          onSelectChoice(target.id);
        }
      } else if (e.key === "Enter" && selectedChoiceId) {
        e.preventDefault();
        onSubmit();
      }
    },
    [disabled, payload.choices, onSelectChoice, selectedChoiceId, onSubmit]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className="space-y-6">
      {/* Workplace Situation Background Card */}
      <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider mb-1.5">
          <MessageSquare className="h-3.5 w-3.5 text-primary" />
          <span>Bối cảnh tình huống</span>
        </div>
        <p className="text-sm sm:text-base font-medium text-slate-800 leading-relaxed">
          {payload.situation}
        </p>
      </div>

      {/* NPC Dialogue Turn */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1.5 text-slate-700">
            <User className="h-3.5 w-3.5 text-slate-500" />
            <span>Đối phương: <strong className="text-slate-900">{payload.npcRole}</strong></span>
          </span>
          <button
            type="button"
            onClick={speakNpcText}
            className="inline-flex items-center gap-1 text-[11px] text-primary hover:text-primary-hover transition-colors"
          >
            <Volume2 className="h-3.5 w-3.5" />
            <span>Nghe thoại</span>
          </button>
        </div>

        {/* NPC Chat Bubble */}
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700 font-bold text-sm shadow-xs">
            {payload.npcRole.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 rounded-2xl rounded-tl-xs border border-slate-200 bg-surface p-4 sm:p-5 shadow-xs">
            <p className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              &ldquo;{payload.npcText}&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Player Response Choices */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>Chọn câu phản hồi của bạn (khéo léo, đúng mực nhất):</span>
          <span className="text-[11px] text-slate-400">
            {selectedChoiceId ? "Đã chọn câu phản hồi" : "Chưa chọn câu phản hồi"}
          </span>
        </div>

        {/* Reply Options List */}
        <div
          role="radiogroup"
          aria-label="Các lựa chọn câu phản hồi"
          className="space-y-3"
        >
          {payload.choices.map((choice, idx) => {
            const isSelected = selectedChoiceId === choice.id;

            return (
              <button
                key={choice.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={disabled}
                onClick={() => onSelectChoice(choice.id)}
                className={cn(
                  "w-full flex items-start gap-3 rounded-2xl border p-4 text-left transition-all min-h-touch focus-visible:outline-2 focus-visible:outline-primary select-none",
                  isSelected
                    ? "border-primary bg-blue-50/80 text-primary font-bold shadow-xs ring-2 ring-primary/20 scale-[1.01]"
                    : "border-slate-200 bg-surface text-slate-800 hover:border-slate-300 hover:bg-slate-50 shadow-xs"
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors mt-0.5",
                    isSelected
                      ? "bg-primary text-white"
                      : "bg-slate-100 text-slate-600"
                  )}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-sm sm:text-base leading-relaxed flex-1">
                  {choice.text}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Keyboard hints */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
        <span>*Mỗi câu trả lời sẽ nhận điểm số theo mức độ khéo léo</span>
        <span className="hidden sm:inline-flex items-center gap-1">
          Bấm <kbd className="rounded-md border bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">1..3</kbd> để chọn, <kbd className="rounded-md border bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600"><CornerDownLeft className="inline h-2.5 w-2.5" /> Enter</kbd> để gửi
        </span>
      </div>
    </div>
  );
}
