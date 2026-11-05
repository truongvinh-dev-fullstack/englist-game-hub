"use client";

import React, { useState } from "react";
import { X, Clock } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { XPBadge } from "@/components/ui/XPBadge";
import { formatDuration } from "@/lib/storage/game-record-storage";
import { ExitConfirmDialog } from "./ExitConfirmDialog";

export interface GameHeaderProps {
  current: number;
  total: number;
  sessionXp?: number;
  elapsedSeconds?: number;
  onExit: () => void;
}

export function GameHeader({
  current,
  total,
  sessionXp = 0,
  elapsedSeconds,
  onExit,
}: GameHeaderProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b border-slate-200/80 bg-surface/95 backdrop-blur-md px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          {/* Exit Button */}
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-primary transition-colors min-h-touch min-w-touch"
            aria-label="Thoát phiên chơi"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Progress Bar */}
          <div className="flex-1 max-w-md">
            <ProgressBar
              value={current}
              max={total}
              label={`Câu ${current} / ${total}`}
              showText={false}
              barClassName="bg-primary"
            />
          </div>

          {/* Timer & Session XP Badge */}
          <div className="flex items-center gap-2 shrink-0">
            {elapsedSeconds !== undefined && (
              <div
                className="flex items-center gap-1.5 rounded-xl bg-slate-100 border border-slate-200/80 px-2.5 py-1 text-xs font-bold text-slate-700 shadow-2xs"
                aria-label={`Thời gian chơi: ${formatDuration(elapsedSeconds)}`}
              >
                <Clock className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                <span className="font-mono text-xs">{formatDuration(elapsedSeconds)}</span>
              </div>
            )}
            <XPBadge xp={sessionXp} size="sm" />
          </div>
        </div>
      </header>

      <ExitConfirmDialog
        isOpen={showConfirm}
        onCancel={() => setShowConfirm(false)}
        onConfirm={() => {
          setShowConfirm(false);
          onExit();
        }}
      />
    </>
  );
}

