import type { ErrorDetectiveQuestion } from "@/lib/validations/content/error-detective";

const TOPIC_OFFICE_ID = "00000000-0000-0000-0000-000000000001";

export const ERROR_DETECTIVE_SAMPLE_QUESTIONS: ErrorDetectiveQuestion[] = [
  {
    game_type: "error-detective",
    topic_id: TOPIC_OFFICE_ID,
    difficulty: "A1",
    skill: "grammar",
    prompt: "Tìm lỗi sai trong câu và chọn cách sửa đúng nhất.",
    explanation_vi: "Chủ ngữ ngôi thứ ba số ít 'He' trong thì hiện tại đơn ở thể phủ định phải dùng trợ động từ 'doesn't' (does not) thay vì 'don't'.",
    concept_tags: ["subject-verb-agreement", "present-simple", "negation"],
    status: "published",
    version: 1,
    public_payload: {
      sentence: "He don't agree with the new project schedule.",
      segments: [
        { id: "s1", text: "He" },
        { id: "s2", text: "don't agree" },
        { id: "s3", text: "with" },
        { id: "s4", text: "the new project schedule." },
      ],
      correctionOptions: [
        { id: "opt1", text: "doesn't agree" },
        { id: "opt2", text: "not agree" },
        { id: "opt3", text: "isn't agree" },
      ],
    },
    private_solution: {
      errorSegmentId: "s2",
      correctOptionId: "opt1",
      grammarConcept: "Subject-Verb Agreement (Hiện tại đơn với he/she/it)",
      correctedSentence: "He doesn't agree with the new project schedule.",
    },
  },
  {
    game_type: "error-detective",
    topic_id: TOPIC_OFFICE_ID,
    difficulty: "A1",
    skill: "grammar",
    prompt: "Tìm lỗi dùng giới từ chỉ thời gian trong câu hẹn gặp khách hàng.",
    explanation_vi: "Trước mốc giờ chính xác (3 PM, 9 AM...) luôn dùng giới từ 'at' thay vì 'on'. Giới từ 'on' chỉ dùng cho ngày trong tuần hoặc ngày tháng cụ thể.",
    concept_tags: ["prepositions-of-time", "schedule"],
    status: "published",
    version: 1,
    public_payload: {
      sentence: "We will meet the client on 3 PM tomorrow.",
      segments: [
        { id: "s11", text: "We will meet" },
        { id: "s12", text: "the client" },
        { id: "s13", text: "on 3 PM" },
        { id: "s14", text: "tomorrow." },
      ],
      correctionOptions: [
        { id: "opt11", text: "at 3 PM" },
        { id: "opt12", text: "in 3 PM" },
        { id: "opt13", text: "by 3 PM" },
      ],
    },
    private_solution: {
      errorSegmentId: "s13",
      correctOptionId: "opt11",
      grammarConcept: "Preposition of Time (Giới từ 'at' trước mốc giờ)",
      correctedSentence: "We will meet the client at 3 PM tomorrow.",
    },
  },
  {
    game_type: "error-detective",
    topic_id: TOPIC_OFFICE_ID,
    difficulty: "A2",
    skill: "grammar",
    prompt: "Tìm lỗi ngữ pháp liên quan đến danh từ không đếm được trong văn phòng.",
    explanation_vi: "'Information' là danh từ không đếm được (uncountable noun), không thêm số nhiều '-s' và không đi với 'many'. Cần dùng 'much information' hoặc 'a lot of information'.",
    concept_tags: ["uncountable-nouns", "quantifiers"],
    status: "published",
    version: 1,
    public_payload: {
      sentence: "She provided us with a lot of useful informations.",
      segments: [
        { id: "s21", text: "She provided" },
        { id: "s22", text: "us with" },
        { id: "s23", text: "a lot of useful" },
        { id: "s24", text: "informations." },
      ],
      correctionOptions: [
        { id: "opt21", text: "information." },
        { id: "opt22", text: "an information." },
        { id: "opt23", text: "informations." },
      ],
    },
    private_solution: {
      errorSegmentId: "s24",
      correctOptionId: "opt21",
      grammarConcept: "Uncountable Nouns (Danh từ không đếm được 'information')",
      correctedSentence: "She provided us with a lot of useful information.",
    },
  },
  {
    game_type: "error-detective",
    topic_id: TOPIC_OFFICE_ID,
    difficulty: "A2",
    skill: "grammar",
    prompt: "Tìm lỗi về động từ tình thái (modal verb) trong câu chỉ thị công việc.",
    explanation_vi: "Sau động từ tình thái 'must' phải là động từ nguyên thể không 'to' (bare infinitive). Do đó 'must to finish' là sai, phải sửa thành 'must finish'.",
    concept_tags: ["modal-verbs", "bare-infinitive"],
    status: "published",
    version: 1,
    public_payload: {
      sentence: "The team must to submit the quarterly report today.",
      segments: [
        { id: "s31", text: "The team" },
        { id: "s32", text: "must to submit" },
        { id: "s33", text: "the quarterly report" },
        { id: "s34", text: "today." },
      ],
      correctionOptions: [
        { id: "opt31", text: "must submit" },
        { id: "opt32", text: "must submitting" },
        { id: "opt33", text: "must submitted" },
      ],
    },
    private_solution: {
      errorSegmentId: "s32",
      correctOptionId: "opt31",
      grammarConcept: "Modal Verbs (Động từ khuyết thiếu + V nguyên mẫu không 'to')",
      correctedSentence: "The team must submit the quarterly report today.",
    },
  },
];
