-- ==============================================================================
-- ENGLISH GAME HUB — SEED DATA FOR MVP (EDITORIAL REVIEWED)
-- ==============================================================================

-- 1. SEED 5 CORE MINI-GAMES
INSERT INTO public.games (slug, type, title, is_enabled, config)
VALUES
  (
    'memory-flip',
    'memory-flip',
    'Memory Flip',
    true,
    '{"pairsCount": 6, "defaultTimeLimitSeconds": 180}'::jsonb
  ),
  (
    'sentence-builder',
    'sentence-builder',
    'Sentence Builder',
    true,
    '{"minQuestions": 5, "maxQuestions": 10, "defaultTimeLimitSeconds": 240}'::jsonb
  ),
  (
    'error-detective',
    'error-detective',
    'Error Detective',
    true,
    '{"minQuestions": 5, "maxQuestions": 10, "defaultTimeLimitSeconds": 240}'::jsonb
  ),
  (
    'listen-choose',
    'listen-choose',
    'Listen & Choose',
    true,
    '{"minQuestions": 5, "maxQuestions": 10, "defaultTimeLimitSeconds": 240}'::jsonb
  ),
  (
    'roleplay',
    'roleplay',
    'Roleplay Simulator',
    true,
    '{"maxTurns": 5, "defaultTimeLimitSeconds": 300}'::jsonb
  )
ON CONFLICT (slug) DO UPDATE
SET
  title = EXCLUDED.title,
  is_enabled = EXCLUDED.is_enabled,
  config = EXCLUDED.config;

-- 2. SEED CORE TOPICS (WITH FIXED UUIDs)
INSERT INTO public.topics (id, slug, title_vi, description, status)
VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'office-meetings',
    'Tiếng Anh Văn phòng & Cuộc họp',
    'Các mẫu câu, thuật ngữ và tình huống giao tiếp phổ biến trong môi trường công sở.',
    'published'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'email-scheduling',
    'Email & Sắp xếp Lịch hẹn',
    'Kỹ năng viết email chuyên nghiệp, xác nhận lịch trình và hẹn gặp đồng nghiệp/đối tác.',
    'published'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'phone-calls',
    'Gọi điện & Trao đổi Công việc',
    'Phản xạ nghe gọi điện thoại công sở, để lại lời nhắn và chuyển máy.',
    'published'
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    'daily-socializing',
    'Giao tiếp Hàng ngày & Xã giao',
    'Trò chuyện thân mật, chào hỏi giờ nghỉ trưa và networking với đồng nghiệp.',
    'published'
  )
ON CONFLICT (slug) DO UPDATE
SET
  id = EXCLUDED.id,
  title_vi = EXCLUDED.title_vi,
  description = EXCLUDED.description,
  status = EXCLUDED.status;

-- 3. SEED INITIAL ACHIEVEMENTS
INSERT INTO public.achievements (code, title, condition)
VALUES
  (
    'first_session',
    'Khởi đầu hứng khởi',
    '{"type": "sessions_completed", "count": 1}'::jsonb
  ),
  (
    'streak_3_days',
    'Thói quen tích cực',
    '{"type": "daily_streak", "days": 3}'::jsonb
  ),
  (
    'perfect_score',
    'Độ chính xác tuyệt đối',
    '{"type": "session_accuracy", "percentage": 100}'::jsonb
  ),
  (
    'xp_centurion',
    'Cán mốc 100 XP',
    '{"type": "total_xp", "xp": 100}'::jsonb
  )
ON CONFLICT (code) DO UPDATE
SET
  title = EXCLUDED.title,
  condition = EXCLUDED.condition;

-- 4. SEED EDITORIAL QUESTIONS ACROSS 6 MINI-GAMES
INSERT INTO public.questions (
  id,
  game_type,
  topic_id,
  difficulty,
  skill,
  prompt,
  explanation_vi,
  concept_tags,
  public_payload,
  private_solution,
  status,
  version
)
VALUES
  -- 4.1 Sentence Builder Question
  (
    '10000000-0000-0000-0000-000000000002',
    'sentence-builder',
    '00000000-0000-0000-0000-000000000001',
    'A1',
    'grammar',
    'Sắp xếp các từ thành câu hoàn chỉnh đúng ngữ pháp.',
    'Cấu trúc thì hiện tại đơn: Chủ ngữ (I) + Trạng từ chỉ tần suất (usually) + Động từ (check) + Tân ngữ (my emails) + Trạng từ thời gian (in the morning).',
    ARRAY['present-simple', 'frequency-adverbs'],
    '{
      "promptVi": "Tôi thường xuyên kiểm tra email vào buổi sáng.",
      "tokens": [
        {"id": "t1", "text": "I"},
        {"id": "t2", "text": "usually"},
        {"id": "t3", "text": "check"},
        {"id": "t4", "text": "my"},
        {"id": "t5", "text": "emails"},
        {"id": "t6", "text": "in the morning."}
      ]
    }'::jsonb,
    '{
      "canonicalSequence": ["t1", "t2", "t3", "t4", "t5", "t6"],
      "canonicalSentence": "I usually check my emails in the morning.",
      "acceptedSequences": [["t6", "t1", "t2", "t3", "t4", "t5"]]
    }'::jsonb,
    'published',
    1
  ),
  -- 4.3 Error Detective Question
  (
    '10000000-0000-0000-0000-000000000003',
    'error-detective',
    '00000000-0000-0000-0000-000000000001',
    'A1',
    'grammar',
    'Tìm lỗi sai trong câu và chọn cách sửa đúng nhất.',
    'Chủ ngữ ngôi thứ ba số ít He trong thì hiện tại đơn ở thể phủ định phải dùng trợ động từ doesn''t (does not) thay vì don''t.',
    ARRAY['subject-verb-agreement', 'present-simple', 'negation'],
    '{
      "sentence": "He don''t agree with the new project schedule.",
      "segments": [
        {"id": "s1", "text": "He"},
        {"id": "s2", "text": "don''t agree"},
        {"id": "s3", "text": "with"},
        {"id": "s4", "text": "the new project schedule."}
      ],
      "correctionOptions": [
        {"id": "opt1", "text": "doesn''t agree"},
        {"id": "opt2", "text": "not agree"},
        {"id": "opt3", "text": "isn''t agree"}
      ]
    }'::jsonb,
    '{
      "errorSegmentId": "s2",
      "correctOptionId": "opt1",
      "grammarConcept": "Subject-Verb Agreement",
      "correctedSentence": "He doesn''t agree with the new project schedule."
    }'::jsonb,
    'published',
    1
  ),
  -- 4.4 Listen & Choose Question
  (
    '10000000-0000-0000-0000-000000000004',
    'listen-choose',
    '00000000-0000-0000-0000-000000000001',
    'A1',
    'listening',
    'Nghe đoạn ghi âm và chọn thông tin đúng về giờ họp.',
    'Đoạn ghi âm nói: The team meeting has been rescheduled to two PM. (Cuộc họp nhóm đã được dời sang lúc 2 giờ chiều).',
    ARRAY['numbers-and-time', 'meeting-schedule'],
    '{
      "audioPath": "/audio/listen-q1-meeting-time.mp3",
      "options": [
        {"id": "opt1", "text": "Cuộc họp diễn ra lúc 2:00 PM"},
        {"id": "opt2", "text": "Cuộc họp diễn ra lúc 3:00 PM"},
        {"id": "opt3", "text": "Cuộc họp bị hủy bỏ"},
        {"id": "opt4", "text": "Cuộc họp dời sang ngày mai lúc 10:00 AM"}
      ]
    }'::jsonb,
    '{
      "correctOptionId": "opt1",
      "transcriptEn": "The team meeting has been rescheduled to 2 PM."
    }'::jsonb,
    'published',
    1
  ),
  -- 4.5 Roleplay Simulator Question
  (
    '10000000-0000-0000-0000-000000000005',
    'roleplay',
    '00000000-0000-0000-0000-000000000001',
    'A2',
    'speaking',
    'Chọn lời phản hồi chuyên nghiệp nhất khi đàm phán gia hạn thời hạn dự án.',
    'Khi xin dời hạn nộp (deadline), cách tiếp cận chuẩn mực là nêu lý do rõ ràng, thể hiện tinh thần trách nhiệm và cam kết một mốc thời gian cụ thể mới.',
    ARRAY['negotiation', 'deadline-extension', 'workplace-etiquette'],
    '{
      "situation": "Dự án gặp sự cố kỹ thuật ngoài dự kiến và bạn cần thêm 1 ngày để kiểm tra chất lượng trước khi bàn giao cho sếp.",
      "npcRole": "Trưởng phòng Kỹ thuật (Mr. Thomas)",
      "npcText": "Hi, can you confirm if the final project deliverables will be ready by 5 PM today?",
      "choices": [
        {
          "id": "c1",
          "text": "We encountered an unexpected technical issue. May we have until tomorrow morning at 10 AM to ensure top quality?"
        },
        {
          "id": "c2",
          "text": "No, today is impossible. You gave us too much work so we need another day."
        },
        {
          "id": "c3",
          "text": "I am not sure, we will try our best but no promises."
        }
      ],
      "isTerminal": false
    }'::jsonb,
    '{
      "evaluations": [
        {
          "choiceId": "c1",
          "rating": "appropriate",
          "scoreDelta": 10,
          "feedbackVi": "Rất xuất sắc! Bạn giải thích nguyên nhân ngắn gọn, lịch sự và cam kết mốc giờ mới."
        },
        {
          "choiceId": "c2",
          "rating": "inappropriate",
          "scoreDelta": 0,
          "feedbackVi": "Chưa phù hợp. Giọng điệu mang tính đổ lỗi cho cấp trên."
        },
        {
          "choiceId": "c3",
          "rating": "acceptable",
          "scoreDelta": 5,
          "feedbackVi": "Tạm chấp nhận nhưng thiếu tính cam kết chuyên nghiệp."
        }
      ]
    }'::jsonb,
    'published',
    1
  )
ON CONFLICT (id) DO UPDATE
SET
  prompt = EXCLUDED.prompt,
  public_payload = EXCLUDED.public_payload,
  private_solution = EXCLUDED.private_solution,
  explanation_vi = EXCLUDED.explanation_vi,
  concept_tags = EXCLUDED.concept_tags,
  status = EXCLUDED.status;
