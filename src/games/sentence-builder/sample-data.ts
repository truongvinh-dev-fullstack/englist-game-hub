import type { SentenceBuilderQuestion } from "@/lib/validations/content/sentence-builder";

const TOPIC_OFFICE_ID = "00000000-0000-0000-0000-000000000001";

export const SENTENCE_BUILDER_SAMPLE_QUESTIONS: SentenceBuilderQuestion[] = [
  {
    game_type: "sentence-builder",
    topic_id: TOPIC_OFFICE_ID,
    difficulty: "A1",
    skill: "grammar",
    prompt: "Sắp xếp các từ thành câu hoàn chỉnh đúng ngữ pháp.",
    explanation_vi: "Cấu trúc thì hiện tại đơn: Chủ ngữ (I) + Trạng từ chỉ tần suất (usually) + Động từ (check) + Tân ngữ (my emails) + Trạng từ thời gian (in the morning).",
    concept_tags: ["present-simple", "frequency-adverbs"],
    status: "published",
    version: 1,
    public_payload: {
      promptVi: "Tôi thường xuyên kiểm tra email vào buổi sáng.",
      tokens: [
        { id: "t1", text: "I" },
        { id: "t2", text: "usually" },
        { id: "t3", text: "check" },
        { id: "t4", text: "my" },
        { id: "t5", text: "emails" },
        { id: "t6", text: "in the morning." },
      ],
    },
    private_solution: {
      canonicalSequence: ["t1", "t2", "t3", "t4", "t5", "t6"],
      canonicalSentence: "I usually check my emails in the morning.",
      acceptedSequences: [
        ["t6", "t1", "t2", "t3", "t4", "t5"], // "In the morning, I usually check my emails."
      ],
    },
  },
  {
    game_type: "sentence-builder",
    topic_id: TOPIC_OFFICE_ID,
    difficulty: "A2",
    skill: "grammar",
    prompt: "Sắp xếp các từ để tạo thành câu hỏi đề nghị lịch sự trong cuộc họp.",
    explanation_vi: "'Could we + V-infinitive' là mẫu câu hỏi lịch sự chuẩn mực để đề xuất dời lịch hoặc thay đổi kế hoạch trong công sở.",
    concept_tags: ["polite-requests", "modal-verbs"],
    status: "published",
    version: 1,
    public_payload: {
      promptVi: "Liệu chúng ta có thể dời cuộc họp sang 3 giờ chiều được không?",
      tokens: [
        { id: "t11", text: "Could" },
        { id: "t12", text: "we" },
        { id: "t13", text: "reschedule" },
        { id: "t14", text: "our" },
        { id: "t15", text: "meeting" },
        { id: "t16", text: "to 3 PM?" },
      ],
    },
    private_solution: {
      canonicalSequence: ["t11", "t12", "t13", "t14", "t15", "t16"],
      canonicalSentence: "Could we reschedule our meeting to 3 PM?",
    },
  },
  {
    game_type: "sentence-builder",
    topic_id: TOPIC_OFFICE_ID,
    difficulty: "A1",
    skill: "grammar",
    prompt: "Sắp xếp câu yêu cầu công việc kèm thời hạn (deadline).",
    explanation_vi: "'Please + V-infinitive + Object + by [Time]' là cấu trúc chuẩn để yêu cầu đồng nghiệp gửi tài liệu trước thời hạn.",
    concept_tags: ["imperatives", "prepositions-of-time"],
    status: "published",
    version: 1,
    public_payload: {
      promptVi: "Vui lòng gửi cho tôi báo cáo dự án trước thứ Sáu.",
      tokens: [
        { id: "t21", text: "Please" },
        { id: "t22", text: "send" },
        { id: "t23", text: "me" },
        { id: "t24", text: "the project report" },
        { id: "t25", text: "by Friday." },
      ],
    },
    private_solution: {
      canonicalSequence: ["t21", "t22", "t23", "t24", "t25"],
      canonicalSentence: "Please send me the project report by Friday.",
      acceptedSequences: [
        ["t25", "t21", "t22", "t23", "t24"], // "By Friday, please send me the project report."
      ],
    },
  },
  {
    game_type: "sentence-builder",
    topic_id: TOPIC_OFFICE_ID,
    difficulty: "A2",
    skill: "grammar",
    prompt: "Sắp xếp câu diễn đạt nhu cầu thảo luận kế hoạch ngân sách.",
    explanation_vi: "Cấu trúc 'need to + V' diễn đạt sự cần thiết; 'discuss' là ngoại động từ đi thẳng với danh từ 'the new budget proposal' mà không cần giới từ 'about'.",
    concept_tags: ["verbs-patterns", "business-meetings"],
    status: "published",
    version: 1,
    public_payload: {
      promptVi: "Chúng ta cần thảo luận về bản đề xuất ngân sách mới.",
      tokens: [
        { id: "t31", text: "We" },
        { id: "t32", text: "need" },
        { id: "t33", text: "to discuss" },
        { id: "t34", text: "the new" },
        { id: "t35", text: "budget proposal." },
      ],
    },
    private_solution: {
      canonicalSequence: ["t31", "t32", "t33", "t34", "t35"],
      canonicalSentence: "We need to discuss the new budget proposal.",
    },
  },
];

