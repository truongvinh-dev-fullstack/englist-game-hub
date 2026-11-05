"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Award,
  Flame,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Shield,
  BookOpen,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getGuestProgress, type GuestProgress } from "@/lib/storage/guest-storage";

export default function ProgressPage() {
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

  const totalAnswered = guestProgress.totalAnswered;
  const correctCount = guestProgress.correctCount;
  const wrongCount = guestProgress.wrongQuestionIds.length;
  const accuracyRate = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
  const estimatedXp = correctCount * 10;

  // Skill progress calculations based on activities
  const skillsData = [
    {
      name: "Từ vựng công sở",
      category: "vocabulary",
      description: "Nhớ từ vựng thiết bị, đồng nghiệp và công việc văn phòng",
      level: "A0–A1",
      progress: Math.min(correctCount * 15, 100),
      color: "bg-blue-600",
    },
    {
      name: "Ngữ pháp chính xác",
      category: "grammar",
      description: "Thì hiện tại, động từ khuyết thiếu và trật tự từ trong câu",
      level: "A1–A2",
      progress: Math.min(correctCount * 12, 100),
      color: "bg-purple-600",
    },
    {
      name: "Luyện nghe hiểu",
      category: "listening",
      description: "Nghe giờ họp, số liệu báo cáo và thông điệp qua điện thoại",
      level: "A1–A2",
      progress: Math.min(correctCount * 10, 100),
      color: "bg-teal-600",
    },
    {
      name: "Giao tiếp & Đàm phán",
      category: "speaking",
      description: "Phản hồi lịch thiệp, đàm phán deadline và xử lý khiếu nại",
      level: "A2–B1",
      progress: Math.min(correctCount * 8, 100),
      color: "bg-amber-600",
    },
  ];

  return (
    <AppShell isGuest={true} userXP={estimatedXp}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-8">
        {/* Header Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Tiến độ học tập cá nhân
            </h1>
            <p className="mt-1 text-sm text-slate-500 max-w-2xl">
              Theo dõi điểm kinh nghiệm, tỷ lệ chính xác và mức độ thành thạo các kỹ năng tiếng Anh công sở.
            </p>
          </div>

          <Link
            href="/review"
            className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-xs sm:text-sm font-bold text-amber-800 hover:bg-amber-100 transition-colors self-start sm:self-auto shadow-xs"
          >
            <RotateCcw className="h-4 w-4 text-amber-600" />
            <span>Ôn tập câu sai ({wrongCount})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Guest Progress Notice Banner */}
        <div className="rounded-2xl border border-blue-200/90 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-primary">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                Tiến độ đang được lưu cục bộ trên thiết bị này
              </p>
              <p className="text-xs text-slate-600">
                Đăng nhập để đồng bộ điểm XP lên máy chủ và không bị mất lịch sử khi đổi trình duyệt.
              </p>
            </div>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary-hover transition-colors shrink-0"
          >
            <span>Đăng nhập ngay</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Stats Grid: 4 Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {/* XP Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-surface p-4 sm:p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Kinh nghiệm (XP)</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <Award className="h-4 w-4" />
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {estimatedXp}
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
              <Sparkles className="h-3 w-3 text-amber-500" />
              <span>Tiến độ cục bộ</span>
            </span>
          </div>

          {/* Accuracy Rate Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-surface p-4 sm:p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Độ chính xác</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {accuracyRate}%
            </p>
            <span className="text-[11px] font-medium text-slate-400">
              {correctCount} / {totalAnswered} câu đúng
            </span>
          </div>

          {/* Streak Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-surface p-4 sm:p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Chuỗi ngày học</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500">
                <Flame className="h-4 w-4 fill-red-500" />
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {totalAnswered > 0 ? "1 ngày" : "0 ngày"}
            </p>
            <span className="text-[11px] font-medium text-slate-400">
              Học mỗi ngày 5 phút
            </span>
          </div>

          {/* Review Queue Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-surface p-4 sm:p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Cần ôn tập lại</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <AlertCircle className="h-4 w-4" />
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {wrongCount} câu
            </p>
            <Link
              href="/review"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
            >
              <span>Xem danh sách câu sai</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Skill Mastery Breakdown */}
        <div className="rounded-3xl border border-slate-200/90 bg-surface p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span>Tiến độ kỹ năng chuyên môn</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Mức độ hoàn thành dựa trên số lượng thử thách bạn đã vượt qua
              </p>
            </div>

            <Link
              href="/games"
              className="text-xs font-bold text-primary hover:text-primary-hover hidden sm:inline-flex items-center gap-1"
            >
              <span>Luyện thêm kỹ năng</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {skillsData.map((skill) => (
              <div
                key={skill.name}
                className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 sm:p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{skill.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{skill.description}</p>
                  </div>
                  <span className="text-xs font-semibold text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {skill.level}
                  </span>
                </div>

                <ProgressBar
                  value={skill.progress}
                  max={100}
                  showText={true}
                  barClassName={skill.color}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Quick Action Footer Banner */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-bold text-slate-800">
                Sẵn sàng cho phiên học tiếp theo?
              </p>
              <p className="text-xs text-slate-500">
                Chỉ 2–5 phút mỗi ngày giúp bạn ghi nhớ tiếng Anh lâu gấp 3 lần.
              </p>
            </div>
          </div>

          <Link
            href="/games/memory-flip"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-primary-hover transition-colors"
          >
            <span>Bắt đầu phiên học mới</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

