import type { RoleplayQuestion } from "@/lib/validations/content/roleplay";

const TOPIC_OFFICE_ID = "00000000-0000-0000-0000-000000000001";

export const ROLEPLAY_SAMPLE_QUESTIONS: RoleplayQuestion[] = [
  {
    game_type: "roleplay",
    topic_id: TOPIC_OFFICE_ID,
    difficulty: "A2",
    skill: "speaking",
    prompt: "Chọn lời phản hồi chuyên nghiệp nhất khi đàm phán gia hạn thời hạn dự án.",
    explanation_vi: "Khi xin dời hạn nộp (deadline), cách tiếp cận chuẩn mực là nêu lý do rõ ràng, thể hiện tinh thần trách nhiệm và cam kết một mốc thời gian cụ thể mới.",
    concept_tags: ["negotiation", "deadline-extension", "workplace-etiquette"],
    status: "published",
    version: 1,
    public_payload: {
      situation: "Dự án gặp sự cố kỹ thuật ngoài dự kiến và bạn cần thêm 1 ngày để kiểm tra chất lượng trước khi bàn giao cho sếp.",
      npcRole: "Trưởng phòng Kỹ thuật (Mr. Thomas)",
      npcText: "Hi, can you confirm if the final project deliverables will be ready by 5 PM today?",
      choices: [
        {
          id: "c1",
          text: "We encountered an unexpected technical issue. May we have until tomorrow morning at 10 AM to ensure top quality?",
        },
        {
          id: "c2",
          text: "No, today is impossible. You gave us too much work so we need another day.",
        },
        {
          id: "c3",
          text: "I am not sure, we will try our best but no promises.",
        },
      ],
      isTerminal: false,
    },
    private_solution: {
      evaluations: [
        {
          choiceId: "c1",
          rating: "appropriate",
          scoreDelta: 10,
          feedbackVi: "Rất xuất sắc! Bạn giải thích nguyên nhân ngắn gọn, lịch sự ('May we have...') và đề xuất mốc giờ mới rõ ràng (10 AM ngày mai) để đảm bảo chất lượng.",
        },
        {
          choiceId: "c2",
          rating: "inappropriate",
          scoreDelta: 0,
          feedbackVi: "Chưa phù hợp. Giọng điệu mang tính đổ lỗi cho cấp trên ('You gave us too much work') và thiếu sự khéo léo trong giao tiếp công sở.",
        },
        {
          choiceId: "c3",
          rating: "acceptable",
          scoreDelta: 5,
          feedbackVi: "Tạm chấp nhận nhưng thiếu tính chuyên nghiệp. Câu trả lời 'no promises' tạo cảm giác thiếu cam kết và khiến quản lý lo lắng.",
        },
      ],
    },
  },
  {
    game_type: "roleplay",
    topic_id: TOPIC_OFFICE_ID,
    difficulty: "B1",
    skill: "speaking",
    prompt: "Chọn cách phản hồi xoa dịu khi đối tác quốc tế bức xúc vì trễ lịch giao hàng.",
    explanation_vi: "Nguyên tắc xử lý khiếu nại khách hàng: Lắng nghe, xin lỗi chân thành về sự bất tiện, nêu giải pháp xử lý ngay lập tức mà không đùn đẩy trách nhiệm.",
    concept_tags: ["client-service", "complaint-handling", "apologies"],
    status: "published",
    version: 1,
    public_payload: {
      situation: "Khách hàng gọi điện phàn nàn vì lô hàng thử nghiệm chưa đến đúng hẹn vào sáng nay như đã thỏa thuận.",
      npcRole: "Khách hàng quốc tế (Ms. Sarah)",
      npcText: "I am really frustrated. Your team promised the sample package would arrive by 9 AM today!",
      choices: [
        {
          id: "c11",
          text: "I sincerely apologize for the delay, Sarah. Let me check with our courier immediately and update you within 15 minutes.",
        },
        {
          id: "c12",
          text: "It is not our fault. The shipping company made a mistake, so please call them.",
        },
        {
          id: "c13",
          text: "Just wait a little bit more, it should be there sometime today.",
        },
      ],
      isTerminal: false,
    },
    private_solution: {
      evaluations: [
        {
          choiceId: "c11",
          rating: "appropriate",
          scoreDelta: 10,
          feedbackVi: "Chuẩn mực dịch vụ khách hàng! Thừa nhận cảm xúc khách hàng, xin lỗi chân thành và cam kết hành động giải quyết trong thời gian cụ thể (15 phút).",
        },
        {
          choiceId: "c12",
          rating: "inappropriate",
          scoreDelta: 0,
          feedbackVi: "Tối kỵ trong dịch vụ. Đổ lỗi cho bên thứ ba ('shipping company') và bảo khách hàng tự đi giải quyết sẽ làm mất niềm tin vào công ty.",
        },
        {
          choiceId: "c13",
          rating: "inappropriate",
          scoreDelta: 0,
          feedbackVi: "Thiếu tôn trọng. Câu trả lời hời hợt 'Just wait' làm gia tăng sự bức xúc của khách hàng.",
        },
      ],
    },
  },
  {
    game_type: "roleplay",
    topic_id: TOPIC_OFFICE_ID,
    difficulty: "A2",
    skill: "speaking",
    prompt: "Bày tỏ quan điểm bất đồng một cách hòa nhã và xây dựng trong cuộc họp dự án.",
    explanation_vi: "Trong văn hóa hội họp phương Tây, khi phản đối một ý kiến, người ta thường dùng kỹ thuật 'Disagree Politely': ghi nhận điểm tích cực trước rồi mới chỉ ra rủi ro cần cân nhắc.",
    concept_tags: ["polite-disagreement", "team-meetings", "assertive-communication"],
    status: "published",
    version: 1,
    public_payload: {
      situation: "Trong buổi họp nhóm, một đồng nghiệp đề xuất cắt giảm thời gian kiểm thử (testing) để ra mắt sản phẩm sớm hơn.",
      npcRole: "Đồng nghiệp Product Owner (Alex)",
      npcText: "I think we should skip the second QA round to launch next week as planned. What do you think?",
      choices: [
        {
          id: "c21",
          text: "I see your point about launching early, but skipping QA might risk major bugs. Could we instead release a beta version to a small group?",
        },
        {
          id: "c22",
          text: "That is a terrible idea. Everyone knows testing is important.",
        },
        {
          id: "c23",
          text: "I agree with Alex. If anything breaks, the QA team can fix it later.",
        },
      ],
      isTerminal: false,
    },
    private_solution: {
      evaluations: [
        {
          choiceId: "c21",
          rating: "appropriate",
          scoreDelta: 10,
          feedbackVi: "Rất thông minh và mang tính xây dựng cao! Bạn ghi nhận quan điểm của đồng nghiệp ('I see your point...'), nêu rõ rủi ro và đưa ra giải pháp thay thế khả thi (beta release).",
        },
        {
          choiceId: "c22",
          rating: "inappropriate",
          scoreDelta: 0,
          feedbackVi: "Quá gay gắt và mang tính công kích cá nhân ('terrible idea'). Cách diễn đạt này gây hiềm khích và làm hỏng bầu không khí hợp tác.",
        },
        {
          choiceId: "c23",
          rating: "acceptable",
          scoreDelta: 5,
          feedbackVi: "Đồng thuận dễ dãi mà không đánh giá đúng rủi ro về chất lượng sản phẩm sẽ gây thiệt hại lớn khi vận hành thực tế.",
        },
      ],
    },
  },
  {
    game_type: "roleplay",
    topic_id: TOPIC_OFFICE_ID,
    difficulty: "B1",
    skill: "speaking",
    prompt: "Nhờ vả đồng nghiệp phòng ban khác hỗ trợ một tác vụ khẩn cấp.",
    explanation_vi: "Khi nhờ vả đồng nghiệp liên phòng ban, cần thể hiện sự tôn trọng thời gian của họ, nêu rõ mức độ ưu tiên và sự hỗ trợ cần thiết.",
    concept_tags: ["asking-for-help", "cross-team-collaboration", "polite-requests"],
    status: "published",
    version: 1,
    public_payload: {
      situation: "Bạn cần phòng Thiết kế xuất file đồ họa cho khách hàng gấp trong hôm nay, nhưng bạn biết họ đang có nhiều việc bận.",
      npcRole: "Trưởng nhóm Thiết kế (Emily)",
      npcText: "Hey! Our team is really swamped with the branding campaign today. What's up?",
      choices: [
        {
          id: "c31",
          text: "I know you're super busy, Emily! I just need a quick 5-minute export for a client deadline today. Would you have a moment this afternoon?",
        },
        {
          id: "c32",
          text: "You must do this for me right now. My client is more important than your campaign.",
        },
        {
          id: "c33",
          text: "Never mind, I'll figure it out myself.",
        },
      ],
      isTerminal: true,
    },
    private_solution: {
      evaluations: [
        {
          choiceId: "c31",
          rating: "appropriate",
          scoreDelta: 10,
          feedbackVi: "Cách tiếp cận tuyệt vời! Thể hiện sự thấu hiểu khối lượng công việc của bạn mình ('I know you are super busy'), ước tính thời gian ngắn gọn (5 phút) và hỏi ý kiến lịch sự.",
        },
        {
          choiceId: "c32",
          rating: "inappropriate",
          scoreDelta: 0,
          feedbackVi: "Áp đặt và thiếu tôn trọng ('You must...', 'My client is more important'). Đồng nghiệp sẽ từ chối hoặc phản ánh thái độ tiêu cực.",
        },
        {
          choiceId: "c33",
          rating: "acceptable",
          scoreDelta: 5,
          feedbackVi: "Thụ động và dễ bỏ cuộc. Bạn sẽ tự tạo áp lực cho bản thân khi không tận dụng được sự phối hợp nhóm.",
        },
      ],
    },
  },
];
