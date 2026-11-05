"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Calendar,
  Mail,
  Users,
  Gamepad2,
  Sparkles,
  ArrowRight,
  Filter,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { WORKPLACE_TOPICS } from "@/lib/data/topics-data";

const TOPIC_ICONS: Record<string, React.ReactNode> = {
  Briefcase: <Briefcase className="h-6 w-6 text-blue-600" />,
  Calendar: <Calendar className="h-6 w-6 text-teal-600" />,
  Mail: <Mail className="h-6 w-6 text-purple-600" />,
  Users: <Users className="h-6 w-6 text-amber-600" />,
};

type LevelFilter = "all" | "A0–A1" | "A1–A2" | "A2–B1";

export default function TopicsPage() {
  const [selectedLevel, setSelectedLevel] = useState<LevelFilter>("all");

  const filteredTopics = WORKPLACE_TOPICS.filter((t) => {
    if (selectedLevel === "all") return true;
    return t.levelRange === selectedLevel;
  });

  return (
    <AppShell isGuest={true} userXP={0}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Chủ đề tiếng Anh công sở
            </h1>
            <p className="mt-1 text-sm text-slate-500 max-w-2xl">
              Chọn chủ đề công việc bạn muốn nâng cao để rèn luyện kết hợp các mini-games từ vựng, ngữ pháp và đàm thoại.
            </p>
          </div>

          <Link
            href="/games"
            className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-blue-50/60 px-4 py-2.5 text-xs sm:text-sm font-bold text-primary hover:bg-blue-100/70 transition-colors self-start sm:self-auto"
          >
            <Gamepad2 className="h-4 w-4" />
            <span>Xem kho trò chơi</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Level Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" />
            <span>Cấp độ:</span>
          </span>

          {[
            { id: "all", label: "Tất cả chủ đề" },
            { id: "A0–A1", label: "Cấp độ A0–A1" },
            { id: "A1–A2", label: "Cấp độ A1–A2" },
            { id: "A2–B1", label: "Cấp độ A2–B1" },
          ].map((tab) => {
            const isSelected = selectedLevel === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedLevel(tab.id as LevelFilter)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all min-h-[36px] ${
                  isSelected
                    ? "bg-primary text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {filteredTopics.map((topic) => (
            <div
              key={topic.slug}
              className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-surface p-6 shadow-xs hover:border-slate-300 hover:shadow-md transition-all duration-200"
            >
              <div className="space-y-4">
                {/* Header: Icon + Level Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 group-hover:scale-105 transition-transform">
                    {TOPIC_ICONS[topic.iconName] || <Briefcase className="h-6 w-6 text-blue-600" />}
                  </div>

                  <span className="inline-flex items-center rounded-full bg-blue-50 text-primary border border-blue-200/60 px-3 py-1 text-xs font-bold">
                    {topic.levelRange}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h2 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">
                    {topic.nameVi}
                  </h2>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">
                    {topic.nameEn}
                  </p>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {topic.description}
                  </p>
                </div>

                {/* Available Games Chips */}
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Các trò chơi hỗ trợ:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {topic.availableGames.map((game) => (
                      <Link
                        key={game.slug}
                        href={`/games/${game.slug}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-50 border border-slate-200/70 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-primary hover:border-blue-200 transition-colors"
                      >
                        <Sparkles className="h-3 w-3 text-amber-500" />
                        <span>{game.title}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Link Footer */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  <strong>{topic.questionCount}</strong> bài luyện tập
                </span>

                <Link
                  href={`/topics/${topic.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary-hover transition-colors"
                >
                  <span>Luyện theo chủ đề</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
