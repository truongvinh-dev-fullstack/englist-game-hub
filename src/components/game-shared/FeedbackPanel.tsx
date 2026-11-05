"use client";

import React from "react";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FeedbackPanelProps {
  isOpen: boolean;
  isCorrect: boolean;
  scoreDelta?: number;
  explanation: string;
  correctAnswerText?: string;
  isLastQuestion?: boolean;
  onNext: () => void;
}

export function FeedbackPanel({
  isOpen,
  isCorrect,
  scoreDelta = 0,
  explanation,
  correctAnswerText,
  isLastQuestion = false,
  onNext,
}: FeedbackPanelProps) {
  if (!isOpen) return null;

  return (
    <div
      role="region"
      aria-live="polite"
      aria-label="Kết quả câu trả lời"
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 border-t p-4 sm:p-6 backdrop-blur-md transition-transform duration-300 animate-in slide-in-from-bottom safe-area-bottom",
        isCorrect
          ? "border-emerald-200 bg-emerald-50/95 text-emerald-950"
          : "border-rose-200 bg-rose-50/95 text-rose-950"
      )}
    >
      <div className="mx-auto flex max-w-4xl flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Status Indicator & Explanation */}
        <div className="flex items-start gap-3.5">
          <div className="shrink-0 pt-0.5">
            {isCorrect ? (
              <CheckCircle2 className="h-7 w-7 text-emerald-600" aria-hidden="true" />
            ) : (
              <XCircle className="h-7 w-7 text-rose-600" aria-hidden="true" />
            )}
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold">
              {isCorrect ? (
                <span>Chính xác! {scoreDelta > 0 && `+${scoreDelta} XP`}</span>
              ) : (
                <span>Chưa chính xác!</span>
              )}
            </h3>

            {/* Explanation */}
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-2xl">
              {explanation}
            </p>

            {/* Revealed Correct Answer if Wrong */}
            {!isCorrect && correctAnswerText && (
              <p className="text-xs font-semibold text-rose-800 pt-1">
                Đáp án đúng: <span className="font-bold underline">{correctAnswerText}</span>
              </p>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="shrink-0 w-full sm:w-auto">
          <button
            type="button"
            onClick={onNext}
            className={cn(
              "w-full sm:w-auto inline-flex min-h-touch items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-md transition-all focus-visible:outline-2",
              isCorrect
                ? "bg-emerald-600 hover:bg-emerald-700 focus-visible:outline-emerald-600"
                : "bg-rose-600 hover:bg-rose-700 focus-visible:outline-rose-600"
            )}
          >
            <span>{isLastQuestion ? "Xem kết quả" : "Câu tiếp theo"}</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

