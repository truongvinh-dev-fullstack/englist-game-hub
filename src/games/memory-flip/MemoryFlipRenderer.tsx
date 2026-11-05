"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Check, Sparkles, Eye, List, HelpCircle } from "lucide-react";
import type { MemoryFlipPublicPayload } from "@/lib/validations/content/memory-flip";
import type { MemoryFlipAnswer } from "./adapter";
import { cn } from "@/lib/utils";

export interface MemoryFlipRendererProps {
  payload: MemoryFlipPublicPayload;
  disabled?: boolean;
  onComplete: (answer: MemoryFlipAnswer) => void;
}

export function MemoryFlipRenderer({
  payload,
  disabled = false,
  onComplete,
}: MemoryFlipRendererProps) {
  const [flippedCards, setFlippedCards] = useState<Array<{ id: string; pairId: string; content: string }>>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [mismatchedCardIds, setMismatchedCardIds] = useState<string[]>([]);
  const [movesCount, setMovesCount] = useState(0);
  const [isListMode, setIsListMode] = useState(false);

  // Selected item in accessible list mode
  const [selectedListEnId, setSelectedListEnId] = useState<string | null>(null);
  const [selectedListViId, setSelectedListViId] = useState<string | null>(null);

  // Clean reset state whenever question payload changes
  useEffect(() => {
    setFlippedCards([]);
    setMatchedPairIds([]);
    setMismatchedCardIds([]);
    setMovesCount(0);
    setSelectedListEnId(null);
    setSelectedListViId(null);
  }, [payload]);

  // Shuffle cards so pairs are never adjacent or predictably placed
  const displayCards = useMemo(() => {
    const list = [...payload.cards];
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }, [payload.cards]);

  const totalPairs = payload.pairsCount;
  const isAllMatched = matchedPairIds.length === totalPairs;

  // Handle card click in Grid Mode
  const handleCardClick = (card: { id: string; pairId: string; content: string }) => {
    if (disabled || isAllMatched) return;

    // Ignore if already matched or currently flipped
    if (matchedPairIds.includes(card.pairId)) return;
    if (flippedCards.some((c) => c.id === card.id)) return;
    if (flippedCards.length >= 2) return;

    const newFlipped = [...flippedCards, card];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMovesCount((prev) => prev + 1);
      const [first, second] = newFlipped;

      if (first.pairId === second.pairId) {
        // MATCH!
        const updatedMatches = [...matchedPairIds, first.pairId];
        setMatchedPairIds(updatedMatches);
        setFlippedCards([]);

        if (updatedMatches.length === totalPairs) {
          onComplete({
            matchedPairsCount: totalPairs,
            isBoardCleared: true,
          });
        }
      } else {
        // MISMATCH
        setMismatchedCardIds([first.id, second.id]);
        setTimeout(() => {
          setFlippedCards([]);
          setMismatchedCardIds([]);
        }, 800);
      }
    }
  };

  // Handle Match in Accessible List Mode
  useEffect(() => {
    if (!selectedListEnId || !selectedListViId) return;

    const enCard = payload.cards.find((c) => c.id === selectedListEnId);
    const viCard = payload.cards.find((c) => c.id === selectedListViId);

    if (enCard && viCard) {
      setMovesCount((prev) => prev + 1);
      if (enCard.pairId === viCard.pairId) {
        const updated = [...matchedPairIds, enCard.pairId];
        setMatchedPairIds(updated);
        setSelectedListEnId(null);
        setSelectedListViId(null);

        if (updated.length === totalPairs) {
          onComplete({
            matchedPairsCount: totalPairs,
            isBoardCleared: true,
          });
        }
      } else {
        setTimeout(() => {
          setSelectedListEnId(null);
          setSelectedListViId(null);
        }, 500);
      }
    }
  }, [selectedListEnId, selectedListViId, matchedPairIds, payload.cards, totalPairs, onComplete]);

  return (
    <div className="space-y-4">
      {/* Game Header Bar: Stats & Accessible Mode Toggle */}
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 border border-slate-200/80 px-4 py-2.5">
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-700">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-amber-500" aria-hidden="true" />
            <span>
              Đã ghép: <strong>{matchedPairIds.length}</strong> / {totalPairs} cặp
            </span>
          </span>
          <span className="text-muted">
            Lượt lật: <strong>{movesCount}</strong>
          </span>
        </div>

        {/* Accessible List-mode toggle button */}
        <button
          type="button"
          onClick={() => setIsListMode(!isListMode)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-surface px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-primary transition-colors min-h-[36px]"
          aria-label={isListMode ? "Chuyển sang dạng lưới thẻ lật" : "Chuyển sang danh sách ghép thẻ trợ năng"}
        >
          {isListMode ? <Eye className="h-3.5 w-3.5" /> : <List className="h-3.5 w-3.5" />}
          <span>{isListMode ? "Xem dạng lưới" : "Chế độ trợ năng"}</span>
        </button>
      </div>

      {/* Accessible List Mode */}
      {isListMode ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* English Column */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Từ tiếng Anh
            </h4>
            <div className="space-y-2">
              {displayCards
                .filter((c) => c.type === "en")
                .map((card) => {
                  const isMatched = matchedPairIds.includes(card.pairId);
                  const isSelected = selectedListEnId === card.id;

                  return (
                    <button
                      key={card.id}
                      type="button"
                      disabled={isMatched || disabled}
                      onClick={() => setSelectedListEnId(card.id)}
                      className={cn(
                        "w-full rounded-xl border p-3 text-left font-semibold text-sm transition-all min-h-touch flex items-center justify-between",
                        isMatched
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800 opacity-80"
                          : isSelected
                          ? "border-primary bg-blue-50 text-primary ring-2 ring-primary/20"
                          : "border-slate-200 bg-surface text-slate-800 hover:bg-slate-50"
                      )}
                    >
                      <span>{card.content}</span>
                      {isMatched && <Check className="h-4 w-4 text-emerald-600" />}
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Vietnamese Column */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Nghĩa tiếng Việt
            </h4>
            <div className="space-y-2">
              {displayCards
                .filter((c) => c.type === "vi")
                .map((card) => {
                  const isMatched = matchedPairIds.includes(card.pairId);
                  const isSelected = selectedListViId === card.id;

                  return (
                    <button
                      key={card.id}
                      type="button"
                      disabled={isMatched || disabled}
                      onClick={() => setSelectedListViId(card.id)}
                      className={cn(
                        "w-full rounded-xl border p-3 text-left font-semibold text-sm transition-all min-h-touch flex items-center justify-between",
                        isMatched
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800 opacity-80"
                          : isSelected
                          ? "border-primary bg-blue-50 text-primary ring-2 ring-primary/20"
                          : "border-slate-200 bg-surface text-slate-800 hover:bg-slate-50"
                      )}
                    >
                      <span>{card.content}</span>
                      {isMatched && <Check className="h-4 w-4 text-emerald-600" />}
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      ) : (
        /* Visual Flip Grid */
        <div
          role="grid"
          aria-label="Bảng lật thẻ từ vựng"
          className={cn(
            "grid gap-2.5 sm:gap-3.5",
            payload.cards.length <= 8
              ? "grid-cols-2 sm:grid-cols-4"
              : "grid-cols-3 sm:grid-cols-4"
          )}
        >
          {displayCards.map((card) => {
            const isMatched = matchedPairIds.includes(card.pairId);
            const isFlipped = isMatched || flippedCards.some((c) => c.id === card.id);
            const isMismatched = mismatchedCardIds.includes(card.id);

            return (
              <button
                key={card.id}
                type="button"
                disabled={isMatched || disabled}
                onClick={() => handleCardClick(card)}
                aria-pressed={isFlipped}
                aria-label={`Thẻ ${isFlipped ? card.content : "úp"}${isMatched ? ", đã ghép đúng" : ""}`}
                className={cn(
                  "relative flex flex-col items-center justify-center rounded-2xl p-3 sm:p-4 text-center transition-all duration-200 select-none min-h-[90px] sm:min-h-[110px] focus-visible:outline-2 focus-visible:outline-primary",
                  isMatched
                    ? "border-2 border-emerald-400 bg-emerald-50/90 text-emerald-900 shadow-xs cursor-default"
                    : isMismatched
                    ? "border-2 border-rose-400 bg-rose-50 text-rose-900 shadow-md animate-shake"
                    : isFlipped
                    ? "border-2 border-primary bg-blue-50/90 text-slate-900 shadow-md scale-[1.02]"
                    : "border-2 border-slate-200 bg-gradient-to-br from-slate-100 to-slate-200 hover:border-indigo-300 hover:shadow-md text-slate-400"
                )}
              >
                {isFlipped ? (
                  <div className="space-y-1 animate-in zoom-in-95 duration-150">
                    <span className="block text-xs sm:text-sm font-bold leading-tight">
                      {card.content}
                    </span>
                    <span className="inline-block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      {card.type === "en" ? "English" : "Tiếng Việt"}
                    </span>
                    {isMatched && (
                      <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
                        <Check className="h-3 w-3 stroke-3" aria-hidden="true" />
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/70 text-slate-400 shadow-inner">
                      <HelpCircle className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Lật thẻ
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

