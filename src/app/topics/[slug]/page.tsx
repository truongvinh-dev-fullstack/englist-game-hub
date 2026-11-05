import React from "react";
import Link from "next/link";
import { ArrowLeft, Play, Sparkles, BookOpen, Clock } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { WORKPLACE_TOPICS } from "@/lib/data/topics-data";

interface TopicDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function TopicDetailPage({ params }: TopicDetailPageProps) {
  const { slug } = await params;
  const topic = WORKPLACE_TOPICS.find((t) => t.slug === slug) || WORKPLACE_TOPICS[0];

  return (
    <AppShell isGuest={true} userXP={0}>
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/topics"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Quay lại danh sách chủ đề</span>
          </Link>
        </div>

        {/* Topic Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-blue-400/30 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 p-6 sm:p-8 text-white shadow-xl space-y-3">
          {/* Decorative ambient blobs */}
          <div className="pointer-events-none absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-cyan-400/20 blur-2xl" />
          <div className="pointer-events-none absolute left-1/3 -top-10 h-40 w-40 rounded-full bg-purple-500/30 blur-2xl" />

          <div className="relative z-10 inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-md px-3 py-1 text-xs font-bold text-amber-300 border border-white/20">
            <BookOpen className="h-3.5 w-3.5 text-amber-300" />
            <span>Chủ đề: {topic.levelRange}</span>
          </div>

          <h1 className="relative z-10 text-2xl sm:text-3xl font-extrabold tracking-tight drop-shadow-sm">
            {topic.nameVi}
          </h1>
          <p className="relative z-10 text-sm font-semibold text-blue-200">
            {topic.nameEn}
          </p>
          <p className="relative z-10 text-sm text-blue-100/90 max-w-2xl leading-relaxed pt-1">
            {topic.description}
          </p>
        </div>

        {/* Games Available in this Topic */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Các trò chơi luyện tập trong chủ đề này
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              {topic.availableGames.length} mini-games
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {topic.availableGames.map((game) => (
              <div
                key={game.slug}
                className="rounded-2xl border border-slate-200/90 bg-surface p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-blue-50 px-2.5 py-0.5 rounded-full">
                      <Sparkles className="h-3 w-3 text-amber-500" />
                      <span>{game.skill}</span>
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>2–4 phút</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 pt-1">
                    {game.title}
                  </h3>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={`/games/${game.slug}`}
                    className="text-xs font-semibold text-slate-600 hover:text-primary transition-colors"
                  >
                    Xem chi tiết
                  </Link>

                  <Link
                    href={`/games/${game.slug}/play`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-primary-hover transition-colors"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Chơi ngay</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
