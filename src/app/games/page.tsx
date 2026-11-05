"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Layers,
  AlignLeft,
  Search,
  Volume2,
  MessageSquare,
  Filter,
  X,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { GameCard } from "@/components/ui/GameCard";
import { ALL_GAMES } from "@/lib/data/games-data";
import { getUserTotalXP } from "@/lib/storage/progress-sync";

const GAME_ICONS: Record<string, React.ReactNode> = {
  "memory-flip": <Layers className="h-6 w-6 text-indigo-600" />,
  "sentence-builder": <AlignLeft className="h-6 w-6 text-purple-600" />,
  "error-detective": <Search className="h-6 w-6 text-violet-600" />,
  "listen-choose": <Volume2 className="h-6 w-6 text-teal-600" />,
  "roleplay": <MessageSquare className="h-6 w-6 text-amber-600" />,
};

type SkillFilter = "all" | "Từ vựng" | "Ngữ pháp" | "Luyện nghe" | "Giao tiếp";
type DifficultyFilter = "all" | "A0" | "A1" | "A2" | "B1";

export default function GameLibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<SkillFilter>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyFilter>("all");
  const [userXp, setUserXp] = useState<number>(0);

  useEffect(() => {
    setUserXp(getUserTotalXP());
    const onUpdated = () => setUserXp(getUserTotalXP());
    window.addEventListener("egh_progress_updated", onUpdated);
    window.addEventListener("storage", onUpdated);
    return () => {
      window.removeEventListener("egh_progress_updated", onUpdated);
      window.removeEventListener("storage", onUpdated);
    };
  }, []);

  const filteredGames = useMemo(() => {
    return ALL_GAMES.filter((game) => {
      // Search text match
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === "" ||
        game.title.toLowerCase().includes(query) ||
        game.description.toLowerCase().includes(query) ||
        game.skill.toLowerCase().includes(query);

      // Skill match
      const matchesSkill = selectedSkill === "all" || game.skill === selectedSkill;

      // Difficulty match
      const matchesDifficulty =
        selectedDifficulty === "all" || game.difficulty === selectedDifficulty;

      return matchesSearch && matchesSkill && matchesDifficulty;
    });
  }, [searchQuery, selectedSkill, selectedDifficulty]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedSkill("all");
    setSelectedDifficulty("all");
  };

  const isFiltered = searchQuery !== "" || selectedSkill !== "all" || selectedDifficulty !== "all";

  return (
    <AppShell isGuest={true} userXP={userXp}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-8">
        {/* Header Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Thư viện trò chơi tiếng Anh
            </h1>
            <p className="mt-1 text-sm text-slate-500 max-w-2xl">
              Kho 5 mini-games tương tác từ 2–5 phút giúp bạn củng cố từ vựng, ngữ pháp, phản xạ nghe và giao tiếp văn phòng.
            </p>
          </div>

          <Link
            href="/review"
            className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs sm:text-sm font-bold text-amber-800 hover:bg-amber-100 transition-colors self-start sm:self-auto shadow-xs"
          >
            <RotateCcw className="h-4 w-4 text-amber-600" />
            <span>Ôn tập câu sai</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Filter & Search Bar */}
        <div className="rounded-2xl border border-slate-200/90 bg-surface p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm trò chơi theo tên hoặc kỹ năng..."
                aria-label="Tìm kiếm trò chơi"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label="Xóa từ khóa tìm kiếm"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Level Selector */}
            <div className="w-full sm:w-48 shrink-0">
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value as DifficultyFilter)}
                aria-label="Chọn cấp độ độ khó"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-sm font-medium text-slate-700 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              >
                <option value="all">Tất cả cấp độ</option>
                <option value="A0">Cấp độ A0 (Mới bắt đầu)</option>
                <option value="A1">Cấp độ A1 (Sơ cấp)</option>
                <option value="A2">Cấp độ A2 (Tiền trung cấp)</option>
                <option value="B1">Cấp độ B1 (Trung cấp)</option>
              </select>
            </div>
          </div>

          {/* Skill Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="h-3 w-3" />
              <span>Kỹ năng:</span>
            </span>

            {[
              { id: "all", label: "Tất cả" },
              { id: "Từ vựng", label: "Từ vựng" },
              { id: "Ngữ pháp", label: "Ngữ pháp" },
              { id: "Luyện nghe", label: "Luyện nghe" },
              { id: "Giao tiếp", label: "Giao tiếp" },
            ].map((tab) => {
              const isSelected = selectedSkill === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedSkill(tab.id as SkillFilter)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all min-h-[36px] ${
                    isSelected
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/25"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}

            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors py-1 px-2"
              >
                <X className="h-3.5 w-3.5" />
                <span>Đặt lại bộ lọc</span>
              </button>
            )}
          </div>
        </div>

        {/* Results Count & Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Hiển thị {filteredGames.length} trò chơi</span>
            {isFiltered && (
              <span className="text-primary">Đang áp dụng bộ lọc</span>
            )}
          </div>

          {filteredGames.length === 0 ? (
            /* Empty State */
            <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-surface p-10 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Không tìm thấy trò chơi phù hợp
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Không có trò chơi nào khớp với từ khóa hoặc bộ lọc kỹ năng bạn đã chọn.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover shadow-xs transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                <span>Xóa bộ lọc để xem tất cả</span>
              </button>
            </div>
          ) : (
            /* Game Card Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredGames.map((game) => (
                <GameCard
                  key={game.slug}
                  slug={game.slug}
                  title={game.title}
                  description={game.description}
                  skill={game.skill}
                  difficulty={game.difficulty}
                  duration={game.duration}
                  icon={GAME_ICONS[game.slug] || <Sparkles className="h-6 w-6" />}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
