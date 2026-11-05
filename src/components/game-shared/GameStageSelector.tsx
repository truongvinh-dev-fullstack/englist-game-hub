"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Play, Layers, Filter, CheckCircle2, ChevronRight, Trophy } from "lucide-react";
import { getCustomQuestionsByGame } from "@/lib/storage/question-storage";
import { getGameStageRecords, formatDuration, type StageRecord } from "@/lib/storage/game-record-storage";
import type { AnyQuestion } from "@/lib/validations/content";
import { cn } from "@/lib/utils";

interface GameStageSelectorProps {
  slug: string;
}

const SESSION_SIZE = 10;

export function GameStageSelector({ slug }: GameStageSelectorProps) {
  const [mounted, setMounted] = useState(false);
  const [customQuestions, setCustomQuestions] = useState<AnyQuestion[]>([]);
  const [stageRecords, setStageRecords] = useState<Record<number, StageRecord>>({});
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [selectedStage, setSelectedStage] = useState<number>(1);
  const [stagePage, setStagePage] = useState<number>(0);

  useEffect(() => {
    setMounted(true);
    const questions = getCustomQuestionsByGame(slug);
    setCustomQuestions(questions);
    const records = getGameStageRecords(slug);
    setStageRecords(records);

    // Intelligently default to next uncompleted stage
    const completedStages = Object.keys(records).map(Number);
    if (completedStages.length > 0) {
      const highest = Math.max(...completedStages);
      const totalS = Math.max(1, Math.ceil(questions.length / SESSION_SIZE));
      const nextS = Math.min(highest + 1, totalS);
      setSelectedStage(nextS);
      const pageForStage = Math.floor((nextS - 1) / 8);
      setStagePage(pageForStage);
    }
  }, [slug]);

  // Extract unique topics / tags from questions
  const availableTopics = useMemo(() => {
    if (customQuestions.length === 0) return [];
    const tags = new Set<string>();
    customQuestions.forEach((q) => {
      const topicId = "topic_id" in q ? q.topic_id : undefined;
      if (topicId && topicId !== "default") tags.add(topicId);
      const conceptTags = q.concept_tags || [];
      conceptTags.forEach((t: string) => {
        if (t && t.length > 1) tags.add(t);
      });
    });
    return Array.from(tags).slice(0, 8); // Top 8 relevant tags
  }, [customQuestions]);

  // Filter questions based on selected topic
  const filteredQuestions = useMemo(() => {
    if (selectedTopic === "all") return customQuestions;
    return customQuestions.filter((q) => {
      const tags: string[] = q.concept_tags || [];
      const topicId: string = "topic_id" in q && q.topic_id ? String(q.topic_id) : "";
      return (
        topicId.toLowerCase() === selectedTopic.toLowerCase() ||
        tags.some((t) => t.toLowerCase() === selectedTopic.toLowerCase())
      );
    });
  }, [customQuestions, selectedTopic]);

  // Total stages (10 questions per stage)
  const totalStages = Math.max(1, Math.ceil(filteredQuestions.length / SESSION_SIZE));

  // Reset selected stage if out of range after filter
  useEffect(() => {
    setSelectedStage(1);
    setStagePage(0);
  }, [selectedTopic]);

  if (!mounted) {
    return (
      <div className="pt-2">
        <Link
          href={`/games/${slug}/play`}
          className="inline-flex min-h-touch items-center gap-2 rounded-2xl bg-primary px-7 py-3.5 text-base font-bold text-white shadow-md hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-primary transition-all"
        >
          <Play className="h-5 w-5 fill-white" aria-hidden="true" />
          <span>Bắt đầu chơi ngay</span>
        </Link>
      </div>
    );
  }

  // If no custom questions, render standard play button
  if (customQuestions.length === 0) {
    return (
      <div className="pt-2">
        <Link
          href={`/games/${slug}/play`}
          className="inline-flex min-h-touch items-center gap-2 rounded-2xl bg-primary px-7 py-3.5 text-base font-bold text-white shadow-md hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-primary transition-all"
        >
          <Play className="h-5 w-5 fill-white" aria-hidden="true" />
          <span>Bắt đầu chơi ngay (Ván mẫu)</span>
        </Link>
      </div>
    );
  }

  const STAGES_PER_PAGE = 8;
  const visibleStages = Array.from({ length: totalStages }, (_, i) => i + 1).slice(
    stagePage * STAGES_PER_PAGE,
    (stagePage + 1) * STAGES_PER_PAGE
  );
  const hasNextStagePage = (stagePage + 1) * STAGES_PER_PAGE < totalStages;
  const hasPrevStagePage = stagePage > 0;

  const playUrl = `/games/${slug}/play?stage=${selectedStage}&limit=${SESSION_SIZE}${
    selectedTopic !== "all" ? `&topic=${encodeURIComponent(selectedTopic)}` : ""
  }`;

  return (
    <div className="pt-3 space-y-5">
      {/* Topic Filter Tabs */}
      {availableTopics.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <Filter className="h-3.5 w-3.5 text-primary" />
            <span>Chọn chủ đề luyện tập:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedTopic("all")}
              className={cn(
                "rounded-xl px-3 py-1.5 text-xs font-semibold transition-all",
                selectedTopic === "all"
                  ? "bg-primary text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              Tất cả ({customQuestions.length} ván)
            </button>
            {availableTopics.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => setSelectedTopic(topic)}
                className={cn(
                  "rounded-xl px-3 py-1.5 text-xs font-semibold transition-all",
                  selectedTopic === topic
                    ? "bg-primary text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                #{topic}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stage Grid Selector */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-primary" />
            <span>
              Chọn màn chơi: (10 ván / màn • {filteredQuestions.length} ván khả dụng)
            </span>
          </div>
          <span className="text-muted text-[11px]">
            Đang chọn Màn {selectedStage}
          </span>
        </div>

        {/* Stage Pills Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {visibleStages.map((stageNum) => {
            const isSelected = selectedStage === stageNum;
            const startIdx = (stageNum - 1) * SESSION_SIZE + 1;
            const endIdx = Math.min(stageNum * SESSION_SIZE, filteredQuestions.length);
            const record = stageRecords[stageNum];

            return (
              <button
                key={stageNum}
                type="button"
                onClick={() => setSelectedStage(stageNum)}
                className={cn(
                  "rounded-xl p-2.5 text-left border transition-all flex flex-col justify-between min-h-[64px]",
                  isSelected
                    ? "border-primary bg-blue-50/80 ring-2 ring-primary/20"
                    : "border-slate-200 bg-surface hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={cn(
                      "text-xs font-bold",
                      isSelected ? "text-primary" : "text-slate-900"
                    )}
                  >
                    Màn {stageNum}
                  </span>
                  {record ? (
                    <span
                      className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 text-[10px] font-bold text-amber-700"
                      title={`Kỷ lục thời gian: ${formatDuration(record.bestTimeSeconds)}`}
                    >
                      <Trophy className="h-2.5 w-2.5" />
                      <span>{formatDuration(record.bestTimeSeconds)}</span>
                    </span>
                  ) : isSelected ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                  ) : null}
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted pt-1">
                  <span>
                    Ván {startIdx} – {endIdx}
                  </span>
                  {record && (
                    <span className="text-[10px] font-semibold text-emerald-600">
                      {record.bestCorrectCount}/{record.totalQuestions} đúng
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Stage Pagination Controls if many stages */}
        {(hasNextStagePage || hasPrevStagePage) && (
          <div className="flex items-center justify-between pt-1 text-xs">
            <button
              type="button"
              disabled={!hasPrevStagePage}
              onClick={() => setStagePage((p) => p - 1)}
              className="px-2.5 py-1 text-slate-600 hover:text-slate-900 disabled:opacity-30 font-semibold"
            >
              &larr; Các màn trước
            </button>
            <span className="text-muted text-[11px]">
              Trang {stagePage + 1} / {Math.ceil(totalStages / STAGES_PER_PAGE)}
            </span>
            <button
              type="button"
              disabled={!hasNextStagePage}
              onClick={() => setStagePage((p) => p + 1)}
              className="px-2.5 py-1 text-slate-600 hover:text-slate-900 disabled:opacity-30 font-semibold"
            >
              Các màn sau &rarr;
            </button>
          </div>
        )}
      </div>

      {/* Main Play CTA Button */}
      <div className="pt-2">
        <Link
          href={playUrl}
          className="inline-flex min-h-touch items-center gap-2 rounded-2xl bg-primary px-7 py-3.5 text-base font-bold text-white shadow-md hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-primary transition-all group"
        >
          <Play className="h-5 w-5 fill-white group-hover:scale-110 transition-transform" aria-hidden="true" />
          <span>
            Bắt đầu Màn {selectedStage} (10 ván chơi)
          </span>
          <ChevronRight className="h-4 w-4 ml-1 opacity-70" />
        </Link>
      </div>
    </div>
  );
}
