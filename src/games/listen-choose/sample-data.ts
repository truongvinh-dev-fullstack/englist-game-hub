import type { ListenChooseQuestion } from "@/lib/validations/content/listen-choose";

const TOPIC_OFFICE_ID = "00000000-0000-0000-0000-000000000001";

export const LISTEN_CHOOSE_SAMPLE_QUESTIONS: ListenChooseQuestion[] = [
  {
    game_type: "listen-choose",
    topic_id: TOPIC_OFFICE_ID,
    difficulty: "A1",
    skill: "listening",
    prompt: "Nghe đoạn ghi âm và chọn thông tin đúng về giờ họp.",
    explanation_vi: "Đoạn ghi âm nói: 'The team meeting has been rescheduled to two PM.' (Cuộc họp nhóm đã được dời sang lúc 2 giờ chiều).",
    concept_tags: ["numbers-and-time", "meeting-schedule"],
    status: "published",
    version: 1,
    public_payload: {
      audioPath: "/audio/listen-q1-meeting-time.mp3",
      speechText: "The team meeting has been rescheduled to 2 PM.",
      options: [
        { id: "opt1", text: "Cuộc họp diễn ra lúc 2:00 PM" },
        { id: "opt2", text: "Cuộc họp diễn ra lúc 3:00 PM" },
        { id: "opt3", text: "Cuộc họp bị hủy bỏ" },
        { id: "opt4", text: "Cuộc họp dời sang ngày mai lúc 10:00 AM" },
      ],
    },
    private_solution: {
      correctOptionId: "opt1",
      transcriptEn: "The team meeting has been rescheduled to 2 PM.",
    },
  },
  {
    game_type: "listen-choose",
    topic_id: TOPIC_OFFICE_ID,
    difficulty: "A2",
    skill: "listening",
    prompt: "Nghe số liệu kinh doanh và chọn tỷ lệ phần trăm được nhắc đến.",
    explanation_vi: "Đoạn ghi âm nói: 'We achieved a thirty percent increase in sales this quarter.' Người học hay nhầm lẫn giữa 'thirteen' (13) và 'thirty' (30). Âm đuôi '-ty' nhấn trọng âm đầu.",
    concept_tags: ["minimal-pairs-numbers", "business-reports"],
    status: "published",
    version: 1,
    public_payload: {
      audioPath: "/audio/listen-q2-sales-growth.mp3",
      speechText: "We achieved a thirty percent increase in sales this quarter.",
      options: [
        { id: "opt11", text: "Tăng trưởng 13%" },
        { id: "opt12", text: "Tăng trưởng 30%" },
        { id: "opt13", text: "Tăng trưởng 33%" },
        { id: "opt14", text: "Giảm 30%" },
      ],
    },
    private_solution: {
      correctOptionId: "opt12",
      transcriptEn: "We achieved a thirty percent increase in sales this quarter.",
    },
  },
  {
    game_type: "listen-choose",
    topic_id: TOPIC_OFFICE_ID,
    difficulty: "A1",
    skill: "listening",
    prompt: "Nghe chỉ dẫn và chọn yêu cầu của người quản lý.",
    explanation_vi: "Đoạn ghi âm nói: 'Please print two copies of the contract and sign on page three.' (Vui lòng in 2 bản hợp đồng và ký ở trang số 3).",
    concept_tags: ["workplace-instructions", "office-documents"],
    status: "published",
    version: 1,
    public_payload: {
      audioPath: "/audio/listen-q3-print-contract.mp3",
      speechText: "Please print two copies of the contract and sign on page three.",
      options: [
        { id: "opt21", text: "Gửi email hợp đồng cho khách hàng" },
        { id: "opt22", text: "In 2 bản hợp đồng và ký ở trang số 3" },
        { id: "opt23", text: "In 3 bản hợp đồng và gửi đi bưu điện" },
        { id: "opt24", text: "Ký nháy vào tất cả các trang hợp đồng" },
      ],
    },
    private_solution: {
      correctOptionId: "opt22",
      transcriptEn: "Please print two copies of the contract and sign on page three.",
    },
  },
  {
    game_type: "listen-choose",
    topic_id: TOPIC_OFFICE_ID,
    difficulty: "A2",
    skill: "listening",
    prompt: "Nghe tin nhắn thoại và chọn nội dung khách hàng yêu cầu.",
    explanation_vi: "Đoạn ghi âm nói: 'Mr. David called and asked for the revised budget proposal.' (Ông David gọi điện và yêu cầu bản đề xuất ngân sách đã chỉnh sửa).",
    concept_tags: ["phone-messages", "business-requests"],
    status: "published",
    version: 1,
    public_payload: {
      audioPath: "/audio/listen-q4-client-message.mp3",
      speechText: "Mr. David called and asked for the revised budget proposal.",
      options: [
        { id: "opt31", text: "Yêu cầu bản đề xuất ngân sách đã chỉnh sửa" },
        { id: "opt32", text: "Yêu cầu thanh toán hóa đơn tháng trước" },
        { id: "opt33", text: "Hủy hợp đồng hợp tác năm tới" },
        { id: "opt34", text: "Mời tham dự tiệc tối công ty" },
      ],
    },
    private_solution: {
      correctOptionId: "opt31",
      transcriptEn: "Mr. David called and asked for the revised budget proposal.",
    },
  },
];

