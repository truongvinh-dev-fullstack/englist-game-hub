"use client";

import React, { useEffect, useCallback } from "react";
import { Search, CheckCircle2, CornerDownLeft, AlertCircle } from "lucide-react";
import type { ErrorDetectivePublicPayload } from "@/lib/validations/content/error-detective";
import { cn } from "@/lib/utils";

export interface ErrorDetectiveRendererProps {
  payload: ErrorDetectivePublicPayload;
  selectedSegmentId: string | null;
  selectedOptionId: string | null;
  disabled?: boolean;
  onSelectSegment: (segmentId: string) => void;
  onSelectOption: (optionId: string) => void;
  onSubmit: () => void;
}

export function ErrorDetectiveRenderer({
  payload,
  selectedSegmentId,
  selectedOptionId,
  disabled = false,
  onSelectSegment,
  onSelectOption,
  onSubmit,
}: ErrorDetectiveRendererProps) {
  const selectedSegment = payload.segments.find((s) => s.id === selectedSegmentId);
  const isReadyToSubmit = Boolean(selectedSegmentId && selectedOptionId);

  // Keyboard shortcut listener: 1-4 for options (when segment selected), Enter to submit
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (disabled) return;

      const num = parseInt(e.key, 10);
      if (selectedSegmentId && !isNaN(num) && num >= 1 && num <= payload.correctionOptions.length) {
        e.preventDefault();
        const targetOption = payload.correctionOptions[num - 1];
        if (targetOption) {
          onSelectOption(targetOption.id);
        }
      } else if (e.key === "Enter" && isReadyToSubmit) {
        e.preventDefault();
        onSubmit();
      }
    },
    [disabled, selectedSegmentId, payload.correctionOptions, onSelectOption, isReadyToSubmit, onSubmit]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className="space-y-6">
      {/* Step 1: Detect the error segment */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1.5 text-primary">
            <Search className="h-3.5 w-3.5" />
            <span>Bước 1: Chạm vào cụm từ có lỗi sai trong câu</span>
          </span>
          {selectedSegment && (
            <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              <span>Đã chọn điểm nghi vấn</span>
            </span>
          )}
        </div>

        {/* Interactive Sentence Container */}
        <div
          role="region"
          aria-label="Câu văn cần phát hiện lỗi"
          className="rounded-2xl border-2 border-slate-200 bg-surface p-4 sm:p-5 shadow-xs"
        >
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {payload.segments.map((segment) => {
              const isSelected = selectedSegmentId === segment.id;

              return (
                <button
                  key={segment.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelectSegment(segment.id)}
                  aria-pressed={isSelected}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-base sm:text-lg font-medium transition-all min-h-touch select-none focus-visible:outline-2 focus-visible:outline-primary",
                    isSelected
                      ? "border-amber-500 bg-amber-50/90 text-amber-950 font-bold shadow-xs ring-2 ring-amber-400/40 scale-102"
                      : "border-slate-200 bg-slate-50/60 text-slate-800 hover:border-slate-300 hover:bg-slate-100"
                  )}
                >
                  <span className="underline decoration-slate-300 decoration-wavy underline-offset-4">
                    {segment.text}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Current Selection Feedback */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            {selectedSegment ? (
              <p className="text-slate-600">
                Phân đoạn đang chọn:{" "}
                <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  &ldquo;{selectedSegment.text}&rdquo;
                </span>
              </p>
            ) : (
              <p className="text-slate-400 italic flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5 text-slate-400" />
                <span>Chạm vào một cụm từ ở trên để tiến hành sửa lỗi</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Step 2: Choose the best correction */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1.5 text-slate-700">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white font-bold">
              2
            </span>
            <span>Bước 2: Chọn phương án sửa chính xác nhất</span>
          </span>
          <span className="text-[11px] text-slate-400">
            {selectedOptionId ? "1 / 1 đã chọn" : "Chưa chọn phương án"}
          </span>
        </div>

        {/* Correction Options Grid */}
        <div
          role="radiogroup"
          aria-label="Các phương án sửa lỗi"
          className="grid grid-cols-1 gap-2.5 sm:grid-cols-3"
        >
          {payload.correctionOptions.map((option, idx) => {
            const isSelected = selectedOptionId === option.id;
            const isInactive = !selectedSegmentId;

            return (
              <button
                key={option.id}
                type="button"
                disabled={disabled || isInactive}
                onClick={() => onSelectOption(option.id)}
                aria-checked={isSelected}
                role="radio"
                className={cn(
                  "flex items-center gap-3 rounded-2xl border p-4 text-left transition-all min-h-touch focus-visible:outline-2 focus-visible:outline-primary select-none",
                  isInactive && "opacity-40 cursor-not-allowed bg-slate-50 border-slate-200",
                  !isInactive && !isSelected && "border-slate-200 bg-surface text-slate-800 hover:border-slate-300 hover:bg-slate-50 shadow-xs",
                  isSelected && "border-primary bg-blue-50/80 text-primary font-bold shadow-xs ring-2 ring-primary/20 scale-101"
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors",
                    isSelected
                      ? "bg-primary text-white"
                      : "bg-slate-100 text-slate-600"
                  )}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-sm leading-snug">{option.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Keyboard hints */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
        <span>*Chạm để chọn lỗi, sau đó chọn phương án sửa</span>
        <span className="hidden sm:inline-flex items-center gap-1">
          Bấm phím <kbd className="rounded-md border bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">1..3</kbd> để chọn phương án, <kbd className="rounded-md border bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600"><CornerDownLeft className="inline h-2.5 w-2.5" /> Enter</kbd> để kiểm tra
        </span>
      </div>
    </div>
  );
}

