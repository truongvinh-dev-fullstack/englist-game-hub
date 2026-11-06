"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  HelpCircle,
  FileSpreadsheet,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  BarChart3,
} from "lucide-react";
import { ALL_GAMES } from "@/lib/data/games-data";
import { WORKPLACE_TOPICS } from "@/lib/data/topics-data";
import { getQuestionsStatistics, loadCustomQuestionsAsync } from "@/lib/storage/question-storage";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(() => getQuestionsStatistics());

  useEffect(() => {
    const refresh = () => setStats(getQuestionsStatistics());
    refresh();
    loadCustomQuestionsAsync().then(refresh);
    window.addEventListener("egh_questions_updated", refresh);
    return () => window.removeEventListener("egh_questions_updated", refresh);
  }, []);

  const totalQuestions = stats.totalQuestions;
  const publishedQuestions = stats.publishedQuestions;
  const draftQuestions = stats.draftQuestions;
  const totalTopics = WORKPLACE_TOPICS.length;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-700 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-indigo-500/20 blur-2xl" />
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200 backdrop-blur-md border border-white/10">
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span>Hệ thống biên tập & kiểm duyệt nội dung MVP</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Bảng điều khiển Quản trị viên
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Quản lý tập trung các câu hỏi, ngân hàng từ vựng, chủ đề công sở và công cụ nhập dữ liệu hàng loạt từ file CSV.
          </p>
        </div>
      </div>

      {/* Metrics Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="rounded-2xl border border-slate-200 bg-surface p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tổng số câu hỏi</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <HelpCircle className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalQuestions}</p>
          <span className="text-[11px] font-medium text-slate-400">Trên toàn bộ 6 mini-games</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-surface p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Đã xuất bản (Live)</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{publishedQuestions}</p>
          <span className="text-[11px] font-medium text-emerald-600">100% sẵn sàng luyện tập</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-surface p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Bản nháp / Đang duyệt</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Clock className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{draftQuestions}</p>
          <span className="text-[11px] font-medium text-slate-400">Không có câu tồn đọng</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-surface p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Chủ đề công sở</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <BookOpen className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalTopics}</p>
          <span className="text-[11px] font-medium text-slate-400">Bao phủ A0 đến B1</span>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <Link
          href="/admin/questions"
          className="group rounded-2xl border border-slate-200 bg-surface p-6 shadow-xs hover:border-primary hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-primary group-hover:scale-105 transition-transform">
              <HelpCircle className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900 group-hover:text-primary transition-colors">
              Quản lý danh sách câu hỏi
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Duyệt xem, chỉnh sửa nội dung, gỡ bỏ hoặc thay đổi trạng thái phát hành câu hỏi trong hệ thống.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-primary">
            <span>Vào danh sách</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/admin/import"
          className="group rounded-2xl border border-slate-200 bg-surface p-6 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
              Nhập dữ liệu từ file CSV
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tải lên hoặc dán nội dung CSV câu hỏi với cơ chế kiểm tra lỗi tự động qua Zod trước khi lưu.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600">
            <span>Mở công cụ Import</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/admin/topics"
          className="group rounded-2xl border border-slate-200 bg-surface p-6 shadow-xs hover:border-purple-500 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 group-hover:scale-105 transition-transform">
              <BookOpen className="h-5 w-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
              Quản lý danh mục chủ đề
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tạo mới chủ đề công sở, gắn thẻ trình độ CEFR và phân phối các mini-games luyện tập tương ứng.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-600">
            <span>Xem các chủ đề</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Distribution by Mini-Games */}
      <div className="rounded-3xl border border-slate-200 bg-surface p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span>Phân bố câu hỏi theo Mini-games</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cân đối ngân hàng câu hỏi để đảm bảo trải nghiệm học tập toàn diện
            </p>
          </div>

          <span className="text-xs font-semibold text-slate-500">6 trò chơi MVP</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {ALL_GAMES.map((game) => (
            <div
              key={game.slug}
              className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 text-center space-y-1.5"
            >
              <span className="text-xs font-bold text-slate-800 block truncate">
                {game.title}
              </span>
              <p className="text-xl font-extrabold text-primary">
                {stats.byGame[game.slug] ?? 4}
              </p>
              <span className="text-[10px] font-semibold text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200 inline-block">
                {game.skill}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
