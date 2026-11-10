"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Layers,
  AlignLeft,
  Search,
  Volume2,
  MessageSquare,
  ArrowRight,
  Flame,
  Target,
  Trophy,
  Zap,
  CheckCircle2,
  Headphones,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { GameCard } from "@/components/ui/GameCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  getUserTotalXP,
  getDailyGoalProgress,
  getSkillProgressSummary,
  type DailyGoalStatus,
  type SkillProgressStatus,
} from "@/lib/storage/progress-sync";

const MVP_GAMES = [
  {
    slug: "memory-flip",
    title: "Memory Flip",
    description: "Lật thẻ và ghép các cặp từ vựng cùng nghĩa tiếng Việt. Rèn trí nhớ và phản xạ từ nhanh chóng.",
    skill: "Từ vựng" as const,
    difficulty: "A1" as const,
    duration: "3 phút",
    icon: <Layers className="h-6 w-6 text-indigo-600" />,
  },
  {
    slug: "sentence-builder",
    title: "Sentence Builder",
    description: "Sắp xếp các khối từ thành câu hoàn chỉnh đúng cấu trúc ngữ pháp giao tiếp văn phòng.",
    skill: "Ngữ pháp" as const,
    difficulty: "A1" as const,
    duration: "3-4 phút",
    icon: <AlignLeft className="h-6 w-6 text-blue-600" />,
  },
  {
    slug: "error-detective",
    title: "Error Detective",
    description: "Tìm điểm sai trong câu tiếng Anh công sở và chọn cách sửa đúng, giải thích ngữ pháp chi tiết.",
    skill: "Ngữ pháp" as const,
    difficulty: "A2" as const,
    duration: "3-5 phút",
    icon: <Search className="h-6 w-6 text-emerald-600" />,
  },
  {
    slug: "listen-choose",
    title: "Listen & Choose",
    description: "Luyện phản xạ nghe câu thoại công sở (phát âm bản ngữ TTS) và chọn phương án phản hồi chuẩn xác.",
    skill: "Luyện nghe" as const,
    difficulty: "A2" as const,
    duration: "2-4 phút",
    icon: <Volume2 className="h-6 w-6 text-amber-600" />,
  },
  {
    slug: "roleplay",
    title: "Roleplay Simulator",
    description: "Mô phỏng hội thoại tình huống văn phòng theo kịch bản rẽ nhánh với nhận xét sư phạm trực quan.",
    skill: "Giao tiếp" as const,
    difficulty: "B1" as const,
    duration: "4-5 phút",
    icon: <MessageSquare className="h-6 w-6 text-rose-600" />,
  },
];

export default function HomePage() {
  const [userXp, setUserXp] = useState<number>(0);
  const [dailyGoal, setDailyGoal] = useState<DailyGoalStatus>({
    completedCount: 0,
    targetCount: 2,
    isCompleted: false,
    percent: 0,
    label: "Chưa hoàn thành lượt chơi nào hôm nay",
  });
  const [skillProgress, setSkillProgress] = useState<SkillProgressStatus>({
    totalXp: 0,
    level: 1,
    levelName: "Sơ cấp A1",
    levelProgressPercent: 0,
    overallPercentage: 0,
    label: "Chưa có điểm kinh nghiệm, hãy bắt đầu ván đầu tiên",
  });
  const [clientUserName, setClientUserName] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    // 1. Check Supabase Auth user
    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          const name =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "Học viên";
          setClientUserName(name);
          return;
        }

        // 2. Fallback to demo cookie
        if (typeof document !== "undefined") {
          const match = document.cookie.match(new RegExp("(?:^|; )egh_demo_user=([^;]*)"));
          if (match && match[1]) {
            try {
              const parsed = JSON.parse(decodeURIComponent(match[1]));
              setClientUserName(parsed.display_name || parsed.email);
            } catch {}
          }
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const name =
            session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            session.user.email?.split("@")[0] ||
            "Học viên";
          setClientUserName(name);
        } else {
          setClientUserName(null);
        }
      });

      unsubscribe = () => {
        authListener?.subscription?.unsubscribe();
      };
    } catch {}

    const refreshData = () => {
      setUserXp(getUserTotalXP());
      setDailyGoal(getDailyGoalProgress());
      setSkillProgress(getSkillProgressSummary());
    };

    refreshData();
    window.addEventListener("egh_progress_updated", refreshData);
    window.addEventListener("storage", refreshData);

    return () => {
      if (unsubscribe) unsubscribe();
      window.removeEventListener("egh_progress_updated", refreshData);
      window.removeEventListener("storage", refreshData);
    };
  }, []);

  return (
    <AppShell isGuest={!clientUserName} userXP={userXp} userName={clientUserName || undefined}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-8">
        {/* Hero Section — Vibrant, high-contrast, gamified banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 p-6 sm:p-10 lg:p-12 text-white shadow-xl shadow-indigo-900/20 border border-indigo-500/30">
          {/* Subtle Decorative Ambient Lighting */}
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-purple-500/30 blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 right-1/4 h-40 w-40 rounded-full bg-pink-500/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-5">
            {/* Playful Floating Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-amber-300 border border-white/20 shadow-xs">
              <Zap className="h-3.5 w-3.5 fill-amber-300 text-amber-300 animate-pulse" />
              <span>Phương pháp Microlearning: 3–5 phút mỗi ngày</span>
            </div>

            {/* Clear, High-Contrast Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white drop-shadow-sm">
              Luyện tiếng Anh công sở <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-white">
                dễ dàng và thú vị mỗi ngày
              </span>
            </h1>

            {/* Clear, High-Contrast Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg text-blue-100 max-w-2xl font-normal leading-relaxed">
              Nâng cao phản xạ từ vựng, ngữ pháp và giao tiếp qua các mini-games tương tác thông minh. Chơi ngay lập tức, không áp lực, tích lũy điểm thưởng XP thực tế.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <Link
                href="/games/memory-flip"
                className="inline-flex min-h-touch items-center gap-2.5 rounded-2xl bg-amber-400 px-6 py-3 text-sm sm:text-base font-extrabold text-slate-950 shadow-lg shadow-amber-500/30 hover:bg-amber-300 hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <span>Chơi nhanh 5 phút</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/games"
                className="inline-flex min-h-touch items-center gap-2 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 px-5 py-3 text-sm sm:text-base font-bold text-white hover:bg-white/25 hover:border-white/50 transition-all duration-200 shadow-sm"
              >
                <Trophy className="h-4 w-4 text-amber-300" />
                <span>Khám phá 5 trò chơi</span>
              </Link>
            </div>

            {/* Quick feature highlights */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-blue-100/90 font-medium border-t border-white/15">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>5 Mini-games độc đáo</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Headphones className="h-3.5 w-3.5 text-cyan-300 shrink-0" />
                <span>Phát âm chuẩn TTS</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>Lưu thời gian kỷ lục</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-yellow-300 shrink-0" />
                <span>Nạp đề từ Excel linh hoạt</span>
              </div>
            </div>
          </div>
        </section>

        {/* Daily Goal & Skill Progress Widgets */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Daily Goal Card */}
          <div className="group rounded-3xl border-2 border-amber-200/90 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/50 p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-amber-300 transition-all duration-200">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30">
                  <Flame className="h-5 w-5 fill-white" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Mục tiêu hằng ngày</h2>
                  <p className="text-xs text-slate-500">Hoàn thành 2 màn chơi để duy trì thói quen</p>
                </div>
              </div>
              <span
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-black transition-colors",
                  dailyGoal.isCompleted
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : "bg-amber-100 text-amber-800 border-amber-200"
                )}
              >
                {dailyGoal.completedCount} / {dailyGoal.targetCount} lượt {dailyGoal.isCompleted && "✓"}
              </span>
            </div>
            <ProgressBar
              value={dailyGoal.completedCount}
              max={dailyGoal.targetCount}
              label={dailyGoal.label}
            />
          </div>

          {/* Skill Mastery Card */}
          <div className="group rounded-3xl border-2 border-indigo-200/90 bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/50 p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-200">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/30">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Tiến độ kỹ năng</h2>
                  <p className="text-xs text-slate-500">Cấp {skillProgress.level} • {skillProgress.levelName}</p>
                </div>
              </div>
              <span className="rounded-full bg-indigo-100 border border-indigo-200 px-3 py-1 text-xs font-bold text-indigo-700">
                {clientUserName ? `Học viên: ${clientUserName}` : "Tiến độ thiết bị"}
              </span>
            </div>
            <ProgressBar
              value={skillProgress.overallPercentage}
              max={100}
              label={skillProgress.label}
            />
          </div>
        </section>

        {/* Featured Games Section */}
        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Kho trò chơi tiếng Anh công sở</span>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                  5 Games
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Chọn trò chơi phù hợp với kỹ năng bạn muốn nâng cao hôm nay
              </p>
            </div>
            <Link
              href="/games"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
            >
              <span>Xem tất cả trò chơi</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Responsive Card Grid with Live Stages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {MVP_GAMES.map((game) => (
              <GameCard key={game.slug} {...game} />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
