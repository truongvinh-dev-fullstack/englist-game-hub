"use client";

import React, { useEffect, useCallback, useMemo } from "react";
import { RotateCcw, X, CornerDownLeft, Sparkles } from "lucide-react";
import type { SentenceBuilderPublicPayload } from "@/lib/validations/content/sentence-builder";
import { cn } from "@/lib/utils";

export interface SentenceBuilderRendererProps {
  payload: SentenceBuilderPublicPayload;
  selectedSequence: string[];
  disabled?: boolean;
  onSequenceChange: (newSequence: string[]) => void;
  onSubmit: () => void;
}

export function SentenceBuilderRenderer({
  payload,
  selectedSequence,
  disabled = false,
  onSequenceChange,
  onSubmit,
}: SentenceBuilderRendererProps) {
  // Add a token to sequence
  const handleAddToken = (tokenId: string) => {
    if (disabled || selectedSequence.includes(tokenId)) return;
    onSequenceChange([...selectedSequence, tokenId]);
  };

  // Remove a token from sequence by index
  const handleRemoveToken = (indexToRemove: number) => {
    if (disabled) return;
    const updated = selectedSequence.filter((_, idx) => idx !== indexToRemove);
    onSequenceChange(updated);
  };

  // Clear all tokens
  const handleReset = () => {
    if (disabled || selectedSequence.length === 0) return;
    onSequenceChange([]);
  };

  // Keyboard shortcut listener: Backspace to undo last token, Enter to submit
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (disabled) return;

      if (e.key === "Backspace" && selectedSequence.length > 0) {
        // Prevent browser back navigation
        e.preventDefault();
        onSequenceChange(selectedSequence.slice(0, -1));
      } else if (e.key === "Enter" && selectedSequence.length === payload.tokens.length) {
        e.preventDefault();
        onSubmit();
      }
    },
    [disabled, selectedSequence, payload.tokens.length, onSequenceChange, onSubmit]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const tokenLookup = new Map(payload.tokens.map((t) => [t.id, t.text]));
  const isFullSequence = selectedSequence.length === payload.tokens.length;

  // Shuffle available tokens pool so they are never displayed in original sentence order
  const displayTokens = useMemo(() => {
    const list = [...payload.tokens];
    if (list.length <= 1) return list;
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    // If by coincidence it's in exact initial order, swap first two
    if (list.every((t, i) => t.id === payload.tokens[i].id)) {
      [list[0], list[1]] = [list[1], list[0]];
    }
    return list;
  }, [payload.tokens]);

  return (
    <div className="space-y-6">
      {/* Vietnamese Prompt Guidance Banner */}
      <div className="rounded-2xl border border-blue-200/90 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-5 shadow-sm">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
          <span>Ý nghĩa cần diễn đạt</span>
        </span>
        <p className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
          &ldquo;{payload.promptVi}&rdquo;
        </p>
      </div>

      {/* Constructed Sentence Area (Click-to-Remove) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>Câu tiếng Anh của bạn (chạm vào từ để xóa):</span>
          {selectedSequence.length > 0 && !disabled && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-red-600 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Đặt lại</span>
            </button>
          )}
        </div>

        <div
          role="region"
          aria-label="Vùng câu tiếng Anh đã ghép"
          className={cn(
            "min-h-[90px] sm:min-h-[105px] w-full rounded-2xl border-2 border-dashed p-3.5 sm:p-4 flex flex-wrap items-center gap-2 transition-colors",
            isFullSequence
              ? "border-emerald-300 bg-emerald-50/30"
              : selectedSequence.length > 0
              ? "border-primary/40 bg-blue-50/20"
              : "border-slate-300 bg-slate-50/60"
          )}
        >
          {selectedSequence.length === 0 ? (
            <p className="text-xs sm:text-sm text-slate-400 italic mx-auto text-center select-none">
              Chạm vào các từ bên dưới theo thứ tự để ghép thành câu hoàn chỉnh...
            </p>
          ) : (
            selectedSequence.map((tokenId, idx) => {
              const text = tokenLookup.get(tokenId) || tokenId;

              return (
                <button
                  key={`${tokenId}-${idx}`}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleRemoveToken(idx)}
                  className="group inline-flex items-center gap-1.5 rounded-xl border border-primary/60 bg-surface px-3 py-2 text-sm sm:text-base font-bold text-primary shadow-xs hover:border-red-300 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-primary transition-all animate-in zoom-in-95 duration-150 min-h-touch"
                  aria-label={`Xóa từ ${text}`}
                >
                  <span>{text}</span>
                  <X className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Available Tokens Pool (Click-to-Add) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>Kho từ vựng có sẵn:</span>
          <span className="text-[11px] text-slate-400">
            {selectedSequence.length} / {payload.tokens.length} từ
          </span>
        </div>

        <div
          role="group"
          aria-label="Danh sách từ vựng có sẵn để chọn"
          className="flex flex-wrap gap-2.5 p-1"
        >
          {displayTokens.map((token) => {
            const isUsed = selectedSequence.includes(token.id);

            return (
              <button
                key={token.id}
                type="button"
                disabled={isUsed || disabled}
                onClick={() => handleAddToken(token.id)}
                className={cn(
                  "rounded-2xl border px-4 py-2.5 text-sm sm:text-base font-bold transition-all min-h-touch focus-visible:outline-2 focus-visible:outline-primary select-none",
                  isUsed
                    ? "border-slate-200 bg-slate-100/80 text-slate-300 opacity-40 cursor-not-allowed shadow-none scale-95"
                    : "border-slate-200/90 bg-surface text-slate-800 shadow-xs hover:-translate-y-0.5 hover:border-primary hover:bg-blue-50/50 hover:text-primary active:translate-y-0"
                )}
              >
                {token.text}
              </button>
            );
          })}
        </div>
      </div>

      {/* Keyboard Hints Callout */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
        <span>*Chạm để thêm từ, chạm từ đã chọn để xóa</span>
        <span className="hidden sm:inline-flex items-center gap-1">
          Bấm <kbd className="rounded-md border bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">Backspace</kbd> để xóa từ cuối, <kbd className="rounded-md border bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600"><CornerDownLeft className="inline h-2.5 w-2.5" /> Enter</kbd> để nộp
        </span>
      </div>
    </div>
  );
}
