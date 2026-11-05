import Link from "next/link";
import {
  Sparkles,
  Layers,
  AlignLeft,
  Search,
  Volume2,
  MessageSquare,
  ArrowRight,
  Flame,
  Target,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { GameCard } from "@/components/ui/GameCard";
import { ProgressBar } from "@/components/ui/ProgressBar";

const MVP_GAMES = [
  {
    slug: "memory-flip",
    title: "Memory Flip",
    description: "Lật thẻ và ghép các cặp từ vựng cùng nghĩa tiếng Việt.",
    skill: "Từ vựng" as const,
    difficulty: "A1" as const,
    duration: "3 phút",
    icon: <Layers className="h-6 w-6 text-indigo-600" />,
  },
  {
    slug: "sentence-builder",
    title: "Sentence Builder",
    description: "Sắp xếp các khối từ thành câu hoàn chỉnh đúng cấu trúc ngữ pháp.",
    skill: "Ngữ pháp" as const,
    difficulty: "A1" as const,
    duration: "3-4 phút",
    icon: <AlignLeft className="h-6 w-6 text-purple-600" />,
  },
  {
    slug: "error-detective",
    title: "Error Detective",
    description: "Tìm điểm sai trong câu tiếng Anh công sở và chọn cách sửa đúng.",
    skill: "Ngữ pháp" as const,
    difficulty: "A2" as const,
    duration: "3-5 phút",
    icon: <Search className="h-6 w-6 text-violet-600" />,
  },
  {
    slug: "listen-choose",
    title: "Listen & Choose",
    description: "Luyện phản xạ nghe câu thoại công sở và chọn phương án phản hồi.",
    skill: "Luyện nghe" as const,
    difficulty: "A2" as const,
    duration: "2-4 phút",
    icon: <Volume2 className="h-6 w-6 text-teal-600" />,
  },
  {
    slug: "roleplay",
    title: "Roleplay Simulator",
    description: "Mô phỏng hội thoại tình huống văn phòng theo kịch bản rẽ nhánh.",
    skill: "Giao tiếp" as const,
    difficulty: "B1" as const,
    duration: "4-5 phút",
    icon: <MessageSquare className="h-6 w-6 text-amber-600" />,
  },
];

export default function HomePage() {
  return (
    <AppShell isGuest={true} userXP={0}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-8">
        {/* Hero Section — Quick Play CTA */}
        <section className="relative overflow-hidden rounded-3xl bg-linear-to-r from-blue-600 to-indigo-700 px-6 py-8 sm:px-10 sm:py-12 text-white shadow-lg">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-medium text-white">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Phiên học nhanh 2–5 phút</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Luyện tiếng Anh công sở dễ dàng mỗi ngày
            </h1>
            <p className="text-sm sm:text-base text-blue-100 max-w-xl">
              Nâng cao phản xạ từ vựng, ngữ pháp và giao tiếp qua các trò chơi tương tác ngắn. Không áp lực, chơi ngay không cần đăng nhập.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/games/memory-flip"
                className="inline-flex min-h-touch items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-blue-600 shadow-md hover:bg-blue-50 transition-colors"
              >
                <span>Chơi nhanh 5 phút</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/games"
                className="inline-flex min-h-touch items-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
              >
                Khám phá kho game
              </Link>
            </div>
          </div>
        </section>

        {/* Daily Goal & Progress Overview (Compact) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-200/80 bg-surface p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <Flame className="h-4 w-4 fill-amber-500" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">Mục tiêu hôm nay</h2>
              </div>
              <span className="text-xs font-semibold text-slate-500">0 / 2 lượt</span>
            </div>
            <ProgressBar value={0} max={2} label="Chưa hoàn thành lượt chơi nào" />
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-surface p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-primary">
                  <Target className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">Tiến độ kỹ năng</h2>
              </div>
              <span className="text-xs font-semibold text-slate-500">Chế độ khách</span>
            </div>
            <ProgressBar value={0} max={100} label="Đăng nhập để đồng bộ tiến độ" />
          </div>
        </section>

        {/* Suggested Games Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Kho trò chơi nổi bật</h2>
              <p className="text-xs text-muted">
                Chọn trò chơi để rèn luyện kỹ năng tiếng Anh tương ứng
              </p>
            </div>
            <Link
              href="/games"
              className="text-xs sm:text-sm font-semibold text-primary hover:text-primary-hover flex items-center gap-1"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Responsive Card Grid: 2 columns mobile, 2-3 tablet, 3-4 desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {MVP_GAMES.map((game) => (
              <GameCard key={game.slug} {...game} />
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
