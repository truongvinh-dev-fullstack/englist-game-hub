"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  RotateCcw,
  CheckCircle2,
  Trash2,
  Play,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { getGuestProgress, type GuestProgress } from "@/lib/storage/guest-storage";

// Curated review item lookup for common sample questions
const KNOWN_QUESTIONS_LOOKUP: Record<
  string,
  {
    title: string;
    gameSlug: string;
    gameName: string;
    skill: string;
    difficulty: string;
    explanation: string;
  }
> = {
  "demo-q1": {
    title: "Chọn nghĩa tiếng Việt của từ: 'Deadline'",
    gameSlug: "memory-flip",
    gameName: "Memory Flip",
    skill: "Từ vựng",
    difficulty: "A1",
    explanation: "Deadline là hạn chót hoặc thời hạn cuối cùng phải hoàn thành công việc.",
  },
  "demo-q2": {
    title: "Điền động từ đúng: 'Please ______ the meeting agenda.'",
    gameSlug: "sentence-builder",
    gameName: "Sentence Builder",
    skill: "Ngữ pháp",
    difficulty: "A2",
    explanation: "'Review the agenda' có nghĩa là xem lại chương trình cuộc họp.",
  },
  "q-0": {
    title: "Phân biệt từ vựng hoặc ngữ pháp trong câu đầu tiên",
    gameSlug: "memory-flip",
    gameName: "Memory Flip",
    skill: "Từ vựng",
    difficulty: "A1",
    explanation: "Chú ý ghi nhớ các cặp danh từ thiết bị và vị trí trong phòng làm việc.",
  },
  "q-1": {
    title: "Cấu trúc câu hoặc trật tự từ vựng",
    gameSlug: "sentence-builder",
    gameName: "Sentence Builder",
    skill: "Ngữ pháp",
    difficulty: "A1",
    explanation: "Thì hiện tại đơn: Chủ ngữ + Trạng từ tần suất + Động từ + Tân ngữ.",
  },
};

export default function ReviewPage() {
  const [guestProgress, setGuestProgress] = useState<GuestProgress>({
    isLocal: true,
    totalAnswered: 0,
    correctCount: 0,
    lastPlayedAt: null,
    wrongQuestionIds: [],
  });

  useEffect(() => {
    setGuestProgress(getGuestProgress());
  }, []);

  const wrongIds = guestProgress.wrongQuestionIds;

  const handleRemoveItem = (idToRemove: string) => {
    if (typeof window === "undefined") return;
    try {
      const updatedIds = wrongIds.filter((id) => id !== idToRemove);
      const updatedProgress: GuestProgress = {
        ...guestProgress,
        wrongQuestionIds: updatedIds,
      };
      window.localStorage.setItem("egh_guest_progress_v1", JSON.stringify(updatedProgress));
      setGuestProgress(updatedProgress);
    } catch {
      // Ignore storage errors
    }
  };

  const handleClearAll = () => {
    if (typeof window === "undefined") return;
    try {
      const updatedProgress: GuestProgress = {
        ...guestProgress,
        wrongQuestionIds: [],
      };
      window.localStorage.setItem("egh_guest_progress_v1", JSON.stringify(updatedProgress));
      setGuestProgress(updatedProgress);
    } catch {
      // Ignore storage errors
    }
  };

  return (
    <AppShell isGuest={true} userXP={guestProgress.correctCount * 10}>
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Header Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <RotateCcw className="h-7 w-7 text-amber-600" />
              <span>Hàng đợi ôn tập câu sai</span>
            </h1>
            <p className="mt-1 text-sm text-slate-500 max-w-xl">
              Hệ thống tự động ghi nhận các câu bạn đã trả lời chưa chính xác để bạn ôn luyện lại cho đến khi thành thạo.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Link
              href="/progress"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-surface px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              <span>Xem tiến độ</span>
            </Link>

            {wrongIds.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors shadow-xs"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Xóa toàn bộ ({wrongIds.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Empty State when no wrong answers */}
        {wrongIds.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-emerald-200 bg-emerald-50/40 p-8 sm:p-12 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-xs">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900">
                Tuyệt vời! Hàng đợi ôn tập đang trống
              </h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Bạn chưa có câu hỏi nào cần ôn tập lại. Hãy tiếp tục thử thách bản thân với các mini-games mới để nâng cao trình độ nhé!
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/games"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-primary-hover transition-colors"
              >
                <span>Khám phá kho trò chơi</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Wrong Questions Review List */
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Danh sách {wrongIds.length} câu hỏi cần củng cố kiến thức:</span>
              <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                Cần ôn luyện
              </span>
            </div>

            <div className="space-y-3">
              {wrongIds.map((id, index) => {
                const item = KNOWN_QUESTIONS_LOOKUP[id] || {
                  title: `Câu hỏi ôn tập số #${index + 1} (${id})`,
                  gameSlug: "memory-flip",
                  gameName: "Luyện tập tổng hợp",
                  skill: "Tổng hợp",
                  difficulty: "A1",
                  explanation: "Hãy đọc kỹ đề bài và xem lại giải thích chi tiết sau mỗi câu hỏi.",
                };

                return (
                  <div
                    key={id}
                    className="rounded-2xl border border-slate-200/90 bg-surface p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-primary border border-blue-200/60">
                            {item.gameName}
                          </span>
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                            {item.skill}
                          </span>
                          <span className="text-xs text-slate-400">
                            Cấp độ {item.difficulty}
                          </span>
                        </div>

                        <h3 className="text-sm sm:text-base font-bold text-slate-900 pt-0.5">
                          {item.title}
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(id)}
                        className="text-slate-400 hover:text-red-600 transition-colors p-1"
                        title="Đánh dấu đã hiểu (xóa khỏi danh sách)"
                        aria-label={`Xóa câu hỏi ${id} khỏi danh sách ôn`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Explanation Callout */}
                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 text-xs text-slate-600 leading-relaxed">
                      <strong className="text-slate-800">Lưu ý ngữ pháp:</strong> {item.explanation}
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(id)}
                        className="text-slate-500 hover:text-slate-800 font-medium transition-colors"
                      >
                        Đã hiểu điểm này
                      </button>

                      <Link
                        href={`/games/${item.gameSlug}/play`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 font-bold text-white shadow-xs hover:bg-primary-hover transition-colors"
                      >
                        <Play className="h-3 w-3 fill-current" />
                        <span>Luyện lại câu này</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
