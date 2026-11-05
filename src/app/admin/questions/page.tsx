"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  HelpCircle,
  FileSpreadsheet,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  Trash2,
} from "lucide-react";
import { MEMORY_FLIP_SAMPLE_QUESTIONS } from "@/games/memory-flip/sample-data";
import { SENTENCE_BUILDER_SAMPLE_QUESTIONS } from "@/games/sentence-builder/sample-data";
import { ERROR_DETECTIVE_SAMPLE_QUESTIONS } from "@/games/error-detective/sample-data";
import { LISTEN_CHOOSE_SAMPLE_QUESTIONS } from "@/games/listen-choose/sample-data";
import { ROLEPLAY_SAMPLE_QUESTIONS } from "@/games/roleplay/sample-data";
import {
  getCustomQuestions,
  deleteCustomQuestion,
  updateCustomQuestionStatus,
} from "@/lib/storage/question-storage";

interface AdminQuestionItem {
  id: string;
  game_type: string;
  prompt: string;
  skill: string;
  difficulty: string;
  status: "published" | "draft" | "review" | "archived";
}

const INITIAL_ADMIN_QUESTIONS: AdminQuestionItem[] = [
  ...MEMORY_FLIP_SAMPLE_QUESTIONS.map((q, idx) => ({
    id: `mf-${idx + 1}`,
    game_type: q.game_type,
    prompt: q.prompt,
    skill: q.skill,
    difficulty: q.difficulty,
    status: q.status as "published" | "draft",
  })),
  ...SENTENCE_BUILDER_SAMPLE_QUESTIONS.map((q, idx) => ({
    id: `sb-${idx + 1}`,
    game_type: q.game_type,
    prompt: q.prompt,
    skill: q.skill,
    difficulty: q.difficulty,
    status: q.status as "published" | "draft",
  })),
  ...ERROR_DETECTIVE_SAMPLE_QUESTIONS.map((q, idx) => ({
    id: `ed-${idx + 1}`,
    game_type: q.game_type,
    prompt: q.prompt,
    skill: q.skill,
    difficulty: q.difficulty,
    status: q.status as "published" | "draft",
  })),
  ...LISTEN_CHOOSE_SAMPLE_QUESTIONS.map((q, idx) => ({
    id: `lc-${idx + 1}`,
    game_type: q.game_type,
    prompt: q.prompt,
    skill: q.skill,
    difficulty: q.difficulty,
    status: q.status as "published" | "draft",
  })),
  ...ROLEPLAY_SAMPLE_QUESTIONS.map((q, idx) => ({
    id: `rp-${idx + 1}`,
    game_type: q.game_type,
    prompt: q.prompt,
    skill: q.skill,
    difficulty: q.difficulty,
    status: q.status as "published" | "draft",
  })),
];

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<AdminQuestionItem[]>(INITIAL_ADMIN_QUESTIONS);
  const [selectedGameType, setSelectedGameType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  useEffect(() => {
    const custom = getCustomQuestions();
    if (custom.length > 0) {
      const customGameTypes = new Set(custom.map((q) => q.game_type));
      const filteredInitial = INITIAL_ADMIN_QUESTIONS.filter(
        (q) => !customGameTypes.has(q.game_type)
      );

      setQuestions([
        ...custom.map((q) => ({
          id: q.id,
          game_type: q.game_type,
          prompt: q.prompt,
          skill: q.skill,
          difficulty: q.difficulty,
          status: q.status || "published",
        })),
        ...filteredInitial,
      ]);
    }
  }, []);

  const filteredQuestions = questions.filter((q) => {
    const matchesGame = selectedGameType === "all" || q.game_type === selectedGameType;
    const matchesStatus = selectedStatus === "all" || q.status === selectedStatus;
    return matchesGame && matchesStatus;
  });

  const handleToggleStatus = (id: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          const nextStatus = q.status === "published" ? "draft" : "published";
          updateCustomQuestionStatus(id, nextStatus);
          return { ...q, status: nextStatus };
        }
        return q;
      })
    );
  };

  const handleDelete = (id: string) => {
    deleteCustomQuestion(id);
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <HelpCircle className="h-7 w-7 text-primary" />
            <span>Quản lý danh sách câu hỏi</span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Hiện có {questions.length} câu hỏi trong ngân hàng dữ liệu.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/import"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-surface px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Nhập CSV</span>
          </Link>

          <button
            type="button"
            onClick={() => alert("Chức năng tạo câu hỏi mới qua form chi tiết sẽ mở trong phiên bản tiếp theo.")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover transition-colors shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Thêm câu hỏi</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-2xl border border-slate-200 bg-surface p-4 shadow-xs flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
          <Filter className="h-3 w-3" />
          <span>Lọc theo:</span>
        </span>

        {/* Game Type Filter */}
        <select
          value={selectedGameType}
          onChange={(e) => setSelectedGameType(e.target.value)}
          aria-label="Lọc theo loại trò chơi"
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-primary focus:bg-white focus:outline-none"
        >
          <option value="all">Tất cả loại trò chơi</option>
          <option value="memory-flip">Memory Flip</option>
          <option value="sentence-builder">Sentence Builder</option>
          <option value="error-detective">Error Detective</option>
          <option value="listen-choose">Listen & Choose</option>
          <option value="roleplay">Roleplay Simulator</option>
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          aria-label="Lọc theo trạng thái"
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-primary focus:bg-white focus:outline-none"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="published">Đã phát hành (Published)</option>
          <option value="draft">Bản nháp (Draft)</option>
        </select>

        <span className="text-xs text-slate-400 ml-auto">
          Hiển thị {filteredQuestions.length} câu hỏi
        </span>
      </div>

      {/* Questions Data Table */}
      <div className="rounded-2xl border border-slate-200 bg-surface shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">ID</th>
                <th className="py-3.5 px-4">Loại game</th>
                <th className="py-3.5 px-4">Nội dung câu hỏi / Prompt</th>
                <th className="py-3.5 px-4">Kỹ năng</th>
                <th className="py-3.5 px-4">Cấp độ</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredQuestions.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                    {q.id}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-primary border border-blue-200/60 whitespace-nowrap">
                      {q.game_type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 max-w-md truncate font-semibold text-slate-900">
                    {q.prompt}
                  </td>
                  <td className="py-3.5 px-4 capitalize">{q.skill}</td>
                  <td className="py-3.5 px-4 font-bold">{q.difficulty}</td>
                  <td className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(q.id)}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-colors ${
                        q.status === "published"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      {q.status === "published" ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Xuất bản</span>
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3" />
                          <span>Nháp</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleDelete(q.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                      title="Xóa câu hỏi"
                      aria-label={`Xóa câu hỏi ${q.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
