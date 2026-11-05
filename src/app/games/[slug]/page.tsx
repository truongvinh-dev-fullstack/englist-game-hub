import React from "react";
import Link from "next/link";
import { ArrowLeft, Clock, BarChart3, BookOpen, CheckCircle, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { GameStageSelector } from "@/components/game-shared/GameStageSelector";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const GAME_DETAILS: Record<
  string,
  {
    title: string;
    description: string;
    skill: string;
    difficulty: string;
    duration: string;
    steps: string[];
    tips: string;
  }
> = {
  "memory-flip": {
    title: "Memory Flip",
    description: "Lật các thẻ từ vựng và ghép nối với nghĩa tiếng Việt tương ứng.",
    skill: "Từ vựng & Trí nhớ",
    difficulty: "A1 – A2",
    duration: "3 phút",
    steps: [
      "Nhấp vào các thẻ bài úp để mở từ tiếng Anh hoặc nghĩa tiếng Việt.",
      "Tìm và ghép đúng cặp từ vựng tương ứng.",
      "Hoàn thành toàn bộ bảng thẻ để đạt điểm tối đa.",
    ],
    tips: "Tập trung ghi nhớ vị trí các thẻ vừa lật.",
  },
  "sentence-builder": {
    title: "Sentence Builder",
    description: "Sắp xếp các khối từ thành câu hoàn chỉnh đúng cấu trúc ngữ pháp.",
    skill: "Cấu trúc ngữ pháp",
    difficulty: "A1 – B1",
    duration: "3–4 phút",
    steps: [
      "Đọc gợi ý nghĩa tiếng Việt của câu cần diễn đạt.",
      "Nhấp chọn các thẻ từ theo thứ tự ngữ pháp chính xác.",
      "Bấm Kiểm tra để hoàn thành câu và nhận giải thích chi tiết.",
    ],
    tips: "Hệ thống hỗ trợ nhiều cách sắp xếp nếu cùng ngữ nghĩa và đúng ngữ pháp.",
  },
  "error-detective": {
    title: "Error Detective",
    description: "Tìm điểm sai trong câu tiếng Anh công sở và chọn phương án sửa đúng.",
    skill: "Ngữ pháp chính xác",
    difficulty: "A2 – B1",
    duration: "3–5 phút",
    steps: [
      "Đọc kỹ câu tiếng Anh được chia thành các phân đoạn.",
      "Chỉ ra phân đoạn chứa lỗi ngữ pháp hoặc lỗi dùng từ.",
      "Chọn cách sửa đúng từ danh sách các phương án.",
    ],
    tips: "Chú ý kỹ sự hòa hợp giữa chủ ngữ và động từ, cũng như các giới từ công sở.",
  },
  "listen-choose": {
    title: "Listen & Choose",
    description: "Luyện phản xạ nghe câu thoại công sở và chọn phản hồi phù hợp.",
    skill: "Kỹ năng nghe hiểu",
    difficulty: "A2 – B1",
    duration: "2–4 phút",
    steps: [
      "Bấm nút nghe câu thoại hoặc câu hỏi tiếng Anh.",
      "Có thể bấm nghe lại nếu chưa nghe rõ.",
      "Chọn 1 trong 4 câu phản hồi phù hợp nhất với ngữ cảnh.",
    ],
    tips: "Transcript tiếng Anh sẽ được hiển thị kèm giải thích sau khi bạn nộp bài.",
  },
  "roleplay": {
    title: "Roleplay Simulator",
    description: "Mô phỏng hội thoại tình huống văn phòng theo kịch bản rẽ nhánh.",
    skill: "Giao tiếp công sở",
    difficulty: "A2 – B1",
    duration: "4–5 phút",
    steps: [
      "Đọc tình huống và phát biểu của đồng nghiệp / khách hàng.",
      "Chọn phản hồi phù hợp nhất theo phép lịch sự công sở.",
      "Theo dõi phản ứng của đối phương và hoàn thành kịch bản.",
    ],
    tips: "Mỗi lựa chọn được chấm điểm: Phù hợp (10 XP), Chấp nhận được (5 XP), Chưa phù hợp (0 XP).",
  },
};

export default async function GameDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const game = GAME_DETAILS[slug] || GAME_DETAILS["memory-flip"];

  return (
    <AppShell isGuest={true}>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Quay lại Trang chủ</span>
          </Link>
        </div>

        {/* Hero Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-surface p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Chế độ Cổ điển (Classic)</span>
            </span>

            <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
              <span className="inline-flex items-center gap-1">
                <BarChart3 className="h-4 w-4" />
                <span>Trình độ: <strong>{game.difficulty}</strong></span>
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Thời gian: <strong>{game.duration}</strong></span>
              </span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {game.title}
          </h1>
          <p className="text-sm text-muted leading-relaxed max-w-2xl">
            {game.description}
          </p>

          <GameStageSelector slug={slug} />
        </div>

        {/* Instructions (<= 3 steps) */}
        <div className="rounded-3xl border border-slate-200/90 bg-surface p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-base font-bold text-slate-900">Cách chơi (3 bước đơn giản)</h2>
          </div>

          <div className="space-y-3.5 pt-1">
            {game.steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-primary">
                  {idx + 1}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-0.5">
                  {step}
                </p>
              </div>
            ))}
          </div>

          {/* Useful Tip */}
          <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-xs text-slate-600 flex items-start gap-2.5 border border-slate-100">
            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
            <p>
              <strong>Mẹo hữu ích:</strong> {game.tips}
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

