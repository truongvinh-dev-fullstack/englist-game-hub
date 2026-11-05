import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ResultSummary } from "@/components/game-shared/ResultSummary";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    sessionId?: string;
    total?: string;
    correct?: string;
    xp?: string;
    wrong?: string;
    stage?: string;
    nextStage?: string;
    topic?: string;
    time?: string;
    bestTime?: string;
    isNewRecord?: string;
  }>;
}

const GAME_NAMES: Record<string, string> = {
  "memory-flip": "Memory Flip",
  "sentence-builder": "Sentence Builder",
  "error-detective": "Error Detective",
  "listen-choose": "Listen & Choose",
  "roleplay": "Roleplay Simulator",
};

export default async function GameResultPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = await searchParams;

  const total = Number(query.total) || 5;
  const correct = Number(query.correct) || 0;
  const totalXp = Number(query.xp) || 0;
  const wrongCount = Number(query.wrong) || Math.max(0, total - correct);
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const gameTitle = GAME_NAMES[slug] || "Mini Game";

  const stage = query.stage ? Number(query.stage) : undefined;
  const nextStage = query.nextStage ? Number(query.nextStage) : undefined;
  const topic = query.topic || undefined;
  const timeSeconds = query.time ? Number(query.time) : undefined;
  const bestTimeSeconds = query.bestTime ? Number(query.bestTime) : undefined;
  const isNewRecord = query.isNewRecord === "1";

  return (
    <AppShell isGuest={true} userXP={totalXp}>
      <ResultSummary
        gameTitle={gameTitle}
        gameSlug={slug}
        totalQuestions={total}
        correctCount={correct}
        totalXp={totalXp}
        accuracyPercentage={accuracy}
        wrongCount={wrongCount}
        isGuest={!query.sessionId}
        stage={stage}
        nextStage={nextStage}
        topic={topic}
        timeSeconds={timeSeconds}
        bestTimeSeconds={bestTimeSeconds}
        isNewRecord={isNewRecord}
      />
    </AppShell>
  );
}

