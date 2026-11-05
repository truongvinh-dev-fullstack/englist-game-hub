"use client";

import React from "react";
import Link from "next/link";
import { Trophy, Target, Award, RotateCcw, ArrowRight, BookOpen, AlertCircle, Clock, Sparkles } from "lucide-react";
import { XPBadge } from "@/components/ui/XPBadge";
import { formatDurationVi } from "@/lib/storage/game-record-storage";
import { cn } from "@/lib/utils";

export interface ResultSummaryProps {
  gameTitle: string;
  gameSlug: string;
  totalQuestions: number;
  correctCount: number;
  totalXp: number;
  accuracyPercentage: number;
  wrongCount?: number;
  isGuest?: boolean;
  stage?: number;
  nextStage?: number;
  topic?: string;
  timeSeconds?: number;
  bestTimeSeconds?: number;
  isNewRecord?: boolean;
}

export function ResultSummary({
  gameTitle,
  gameSlug,
  totalQuestions,
  correctCount,
  totalXp,
  accuracyPercentage,
  wrongCount = 0,
  isGuest = true,
  stage,
  nextStage,
  topic,
  timeSeconds,
  bestTimeSeconds,
  isNewRecord = false,
}: ResultSummaryProps) {
  const isGreat = accuracyPercentage >= 80;
  const isPass = accuracyPercentage >= 50;

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6 space-y-6 animate-in fade-in duration-300">
      {/* Top Trophy Banner */}
      <div className="rounded-3xl border border-slate-200/90 bg-surface p-6 sm:p-8 text-center shadow-xs space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-50 text-amber-500 shadow-inner">
          <Trophy className="h-8 w-8" aria-hidden="true" />
        </div>

        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            {gameTitle} {stage ? `• Màn ${stage}` : ""}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {isGreat ? "Xuất sắc!" : isPass ? "Hoàn thành tốt!" : "Cố gắng hơn ở lần sau!"}
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-muted">
            Bạn đã hoàn thành phiên luyện tập tiếng Anh phản xạ.
          </p>
        </div>

        {/* Big XP Badge */}
        <div className="flex justify-center pt-2">
          <XPBadge xp={totalXp} size="lg" className="px-5 py-2 text-lg shadow-sm" />
        </div>

        {/* New Personal Best Record Badge */}
        {isNewRecord && (
          <div className="flex justify-center pt-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-300 px-3.5 py-1 text-xs font-bold text-amber-900 shadow-xs">
              <Sparkles className="h-4 w-4 text-amber-600 animate-spin" />
              <span>🏆 Phá kỷ lục! Thời gian nhanh nhất</span>
            </span>
          </div>
        )}

        {/* Clear distinction notice: XP vs Mastery */}
        <p className="text-[11px] text-slate-400 italic">
          *Điểm XP ghi nhận nỗ lực luyện tập, không thay thế chứng chỉ hoặc xác nhận đã thành thạo hoàn toàn.
        </p>
      </div>

      {/* Stats Grid */}
      <div className={cn("grid gap-3.5", timeSeconds !== undefined ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2")}>
        <div className="rounded-2xl border border-slate-200/90 bg-surface p-4 text-center shadow-xs">
          <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-primary">
            <Target className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">{accuracyPercentage}%</div>
          <div className="text-xs text-muted font-medium mt-0.5">Độ chính xác</div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-surface p-4 text-center shadow-xs">
          <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Award className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            {correctCount} / {totalQuestions}
          </div>
          <div className="text-xs text-muted font-medium mt-0.5">Số câu đúng</div>
        </div>

        {timeSeconds !== undefined && (
          <>
            <div className="rounded-2xl border border-slate-200/90 bg-surface p-4 text-center shadow-xs">
              <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Clock className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="text-sm sm:text-base font-black text-slate-900 leading-tight pt-1">
                {formatDurationVi(timeSeconds)}
              </div>
              <div className="text-xs text-muted font-medium mt-1">Thời gian màn</div>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-surface p-4 text-center shadow-xs">
              <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Trophy className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="text-sm sm:text-base font-black text-slate-900 leading-tight pt-1">
                {formatDurationVi(bestTimeSeconds || timeSeconds)}
              </div>
              <div className="text-xs text-muted font-medium mt-1">Kỷ lục tốt nhất</div>
            </div>
          </>
        )}
      </div>

      {/* Guest Notice Callout */}
      {isGuest && (
        <div className="rounded-2xl bg-amber-50/80 border border-amber-200/70 p-4 text-xs text-amber-900 flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="leading-relaxed">
            Bạn đang chơi ở <strong>Chế độ khách</strong>.{" "}
            <Link href="/login" className="font-bold underline hover:text-amber-950">
              Đăng nhập ngay
            </Link>{" "}
            để lưu tiến độ và tích lũy XP chính thức vào hồ sơ cá nhân.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2.5 pt-2">
        {nextStage && (
          <Link
            href={`/games/${gameSlug}/play?stage=${nextStage}&limit=10${topic ? `&topic=${encodeURIComponent(topic)}` : ""}`}
            className="w-full min-h-touch rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-xs hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-primary transition-colors flex items-center justify-center gap-2"
          >
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
            <span>Tiếp tục Màn {nextStage} &rarr;</span>
          </Link>
        )}

        <Link
          href={`/games/${gameSlug}/play${stage ? `?stage=${stage}&limit=10` : ""}${topic ? `${stage ? "&" : "?"}topic=${encodeURIComponent(topic)}` : ""}`}
          className={cn(
            "w-full min-h-touch rounded-xl px-4 py-3 text-sm font-bold transition-colors flex items-center justify-center gap-2",
            nextStage
              ? "border border-slate-200 bg-surface text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-slate-400"
              : "bg-primary text-white shadow-xs hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-primary"
          )}
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          <span>{nextStage ? `Chơi lại Màn ${stage || 1}` : "Chơi lại lượt khác"}</span>
        </Link>

        {wrongCount > 0 && (
          <Link
            href="/review"
            className="w-full min-h-touch rounded-xl border border-slate-200 bg-surface px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-slate-400 transition-colors flex items-center justify-center gap-2"
          >
            <BookOpen className="h-4 w-4 text-slate-500" aria-hidden="true" />
            <span>Ôn lại các câu sai ({wrongCount})</span>
          </Link>
        )}

        <Link
          href="/games"
          className="w-full min-h-touch rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-slate-400 transition-colors flex items-center justify-center gap-2"
        >
          <span>Khám phá các game khác</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

