export interface WorkplaceTopic {
  id: string;
  slug: string;
  nameVi: string;
  nameEn: string;
  description: string;
  levelRange: "A0–A1" | "A1–A2" | "A2–B1";
  iconName: "Briefcase" | "Calendar" | "Mail" | "Users" | "PhoneCall" | "Award";
  questionCount: number;
  availableGames: Array<{
    slug: string;
    title: string;
    skill: string;
  }>;
}

export const WORKPLACE_TOPICS: WorkplaceTopic[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    slug: "office-essentials",
    nameVi: "Thiết bị & Văn phòng cơ bản",
    nameEn: "Office Essentials",
    description: "Làm quen với các thiết bị, đồ dùng làm việc, danh từ và động từ thông dụng nhất tại nơi công sở.",
    levelRange: "A0–A1",
    iconName: "Briefcase",
    questionCount: 20,
    availableGames: [
      { slug: "memory-flip", title: "Memory Flip", skill: "Từ vựng & Trí nhớ" },
      { slug: "sentence-builder", title: "Sentence Builder", skill: "Ngữ pháp" },
      { slug: "listen-choose", title: "Listen & Choose", skill: "Luyện nghe" },
    ],
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    slug: "meetings-and-schedules",
    nameVi: "Họp hành & Quản lý lịch trình",
    nameEn: "Meetings & Schedules",
    description: "Rèn luyện kỹ năng đặt lịch hẹn, dời giờ họp, lắng nghe thông báo thời gian và xác nhận biên bản.",
    levelRange: "A1–A2",
    iconName: "Calendar",
    questionCount: 24,
    availableGames: [
      { slug: "listen-choose", title: "Listen & Choose", skill: "Luyện nghe" },
      { slug: "error-detective", title: "Error Detective", skill: "Ngữ pháp" },
      { slug: "sentence-builder", title: "Sentence Builder", skill: "Ngữ pháp" },
    ],
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    slug: "emails-and-workflow",
    nameVi: "Viết Email & Báo cáo tiến độ",
    nameEn: "Emails & Task Management",
    description: "Nắm vững mẫu câu yêu cầu tài liệu, báo cáo deadline, chỉ dẫn công việc và tránh các lỗi ngữ pháp văn bản.",
    levelRange: "A1–A2",
    iconName: "Mail",
    questionCount: 18,
    availableGames: [
      { slug: "sentence-builder", title: "Sentence Builder", skill: "Ngữ pháp" },
      { slug: "error-detective", title: "Error Detective", skill: "Ngữ pháp" },
      { slug: "listen-choose", title: "Listen & Choose", skill: "Luyện nghe" },
    ],
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    slug: "client-communication",
    nameVi: "Giao tiếp đối tác & Xử lý tình huống",
    nameEn: "Client Communication & Etiquette",
    description: "Thực hành đàm phán lịch thiệp, phản hồi khiếu nại khách hàng, thể hiện sự đồng thuận hoặc bất đồng xây dựng.",
    levelRange: "A2–B1",
    iconName: "Users",
    questionCount: 16,
    availableGames: [
      { slug: "roleplay", title: "Roleplay Simulator", skill: "Giao tiếp" },
      { slug: "listen-choose", title: "Listen & Choose", skill: "Luyện nghe" },
      { slug: "error-detective", title: "Error Detective", skill: "Ngữ pháp" },
    ],
  },
];

