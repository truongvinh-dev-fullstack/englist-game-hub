export interface GameMeta {
  slug: string;
  title: string;
  description: string;
  skill: "Từ vựng" | "Ngữ pháp" | "Luyện nghe" | "Giao tiếp";
  difficulty: "A0" | "A1" | "A2" | "B1";
  duration: string;
  category: "vocabulary" | "grammar" | "listening" | "speaking";
}

export const ALL_GAMES: GameMeta[] = [
  {
    slug: "memory-flip",
    title: "Memory Flip",
    description: "Lật thẻ và ghép các cặp từ vựng cùng nghĩa tiếng Việt.",
    skill: "Từ vựng",
    difficulty: "A1",
    duration: "3 phút",
    category: "vocabulary",
  },
  {
    slug: "sentence-builder",
    title: "Sentence Builder",
    description: "Sắp xếp các khối từ thành câu hoàn chỉnh đúng cấu trúc ngữ pháp.",
    skill: "Ngữ pháp",
    difficulty: "A1",
    duration: "3-4 phút",
    category: "grammar",
  },
  {
    slug: "error-detective",
    title: "Error Detective",
    description: "Tìm điểm sai trong câu tiếng Anh công sở và chọn cách sửa đúng.",
    skill: "Ngữ pháp",
    difficulty: "A2",
    duration: "3-5 phút",
    category: "grammar",
  },
  {
    slug: "listen-choose",
    title: "Listen & Choose",
    description: "Luyện phản xạ nghe câu thoại công sở và chọn phương án phản hồi.",
    skill: "Luyện nghe",
    difficulty: "A2",
    duration: "2-4 phút",
    category: "listening",
  },
  {
    slug: "roleplay",
    title: "Roleplay Simulator",
    description: "Mô phỏng hội thoại tình huống văn phòng theo kịch bản rẽ nhánh.",
    skill: "Giao tiếp",
    difficulty: "B1",
    duration: "4-5 phút",
    category: "speaking",
  },
];

