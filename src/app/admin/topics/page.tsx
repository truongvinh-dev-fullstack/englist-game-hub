"use client";

import React, { useState } from "react";
import { BookOpen, Plus, Sparkles, CheckCircle2 } from "lucide-react";
import { WORKPLACE_TOPICS, type WorkplaceTopic } from "@/lib/data/topics-data";

export default function AdminTopicsPage() {
  const [topics, setTopics] = useState<WorkplaceTopic[]>(WORKPLACE_TOPICS);
  const [isAdding, setIsAdding] = useState(false);
  const [newTopicNameVi, setNewTopicNameVi] = useState("");
  const [newTopicNameEn, setNewTopicNameEn] = useState("");
  const [newTopicDescription, setNewTopicDescription] = useState("");
  const [newTopicLevel, setNewTopicLevel] = useState<"A0–A1" | "A1–A2" | "A2–B1">("A1–A2");

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicNameVi || !newTopicNameEn) return;

    const slug = newTopicNameEn.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const created: WorkplaceTopic = {
      id: crypto.randomUUID(),
      slug,
      nameVi: newTopicNameVi,
      nameEn: newTopicNameEn,
      description: newTopicDescription || "Mô tả chủ đề công sở mới.",
      levelRange: newTopicLevel,
      iconName: "Briefcase",
      questionCount: 0,
      availableGames: [
        { slug: "memory-flip", title: "Memory Flip", skill: "Từ vựng" },
        { slug: "sentence-builder", title: "Sentence Builder", skill: "Ngữ pháp" },
      ],
    };

    setTopics((prev) => [...prev, created]);
    setNewTopicNameVi("");
    setNewTopicNameEn("");
    setNewTopicDescription("");
    setIsAdding(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-purple-600" />
            <span>Quản lý danh mục chủ đề</span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Hiện có {topics.length} chủ đề tiếng Anh công sở trong hệ thống.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>{isAdding ? "Đóng form" : "Thêm chủ đề mới"}</span>
        </button>
      </div>

      {/* Add New Topic Form */}
      {isAdding && (
        <form
          onSubmit={handleCreateTopic}
          className="rounded-3xl border border-purple-200 bg-purple-50/40 p-6 shadow-xs space-y-4"
        >
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span>Tạo mới chủ đề công sở</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tên chủ đề (Tiếng Việt) *
              </label>
              <input
                type="text"
                required
                value={newTopicNameVi}
                onChange={(e) => setNewTopicNameVi(e.target.value)}
                placeholder="Ví dụ: Đàm phán hợp đồng thương mại"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-purple-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tên chủ đề (Tiếng Anh) *
              </label>
              <input
                type="text"
                required
                value={newTopicNameEn}
                onChange={(e) => setNewTopicNameEn(e.target.value)}
                placeholder="Ví dụ: Contract Negotiations"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-purple-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mô tả ngắn gọn
              </label>
              <input
                type="text"
                value={newTopicDescription}
                onChange={(e) => setNewTopicDescription(e.target.value)}
                placeholder="Mô tả các tình huống hoặc từ vựng của chủ đề này..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-purple-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cấp độ trình độ
              </label>
              <select
                value={newTopicLevel}
                onChange={(e) => setNewTopicLevel(e.target.value as "A0–A1" | "A1–A2" | "A2–B1")}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-purple-600 focus:outline-none"
              >
                <option value="A0–A1">A0–A1 (Cơ bản)</option>
                <option value="A1–A2">A1–A2 (Sơ cấp)</option>
                <option value="A2–B1">A2–B1 (Trung cấp)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 shadow-xs"
            >
              Lưu chủ đề
            </button>
          </div>
        </form>
      )}

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {topics.map((t) => (
          <div
            key={t.id}
            className="rounded-2xl border border-slate-200 bg-surface p-5 shadow-xs space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">{t.nameVi}</h3>
                <p className="text-xs font-medium text-slate-400">{t.nameEn}</p>
              </div>
              <span className="rounded-full bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 text-xs font-bold">
                {t.levelRange}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{t.description}</p>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>{t.questionCount} bài tập</span>
              </span>
              <span className="text-slate-400">
                {t.availableGames.length} mini-games tích hợp
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

