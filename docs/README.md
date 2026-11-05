# English Game Hub — Implementation Documentation v1.0

## Mục tiêu
Website mini game luyện tiếng Anh cho người đi làm (A0–B1), phiên chơi 2–5 phút, mobile-first, chơi thử không cần tài khoản.

## MVP scope
6 game: Picture Match, Memory Flip, Sentence Builder, Error Detective, Listen & Choose, Roleplay Simulator (hội thoại kịch bản, không AI tự do). Nội dung mục tiêu: 300 từ vựng, 12 điểm ngữ pháp, 20 kịch bản hội thoại; nội dung phải được kiểm duyệt trước phát hành.

## Thứ tự đọc
1. `docs/PRD.md` → 2. `docs/SRS.md` → 3. `docs/UI_UX_SPEC.md` → 4. `docs/GAME_ENGINE_SPEC.md` → 5. `docs/DATABASE_SCHEMA.md` → 6. `docs/API_SPEC.md` → 7. `docs/IMPLEMENTATION_PLAN.md`.

AI coding: đọc `GEMINI.md` trước mỗi phiên; chỉ thực hiện một task trong `docs/TASK_BACKLOG.md`; báo cáo theo `docs/AI_WORKFLOW.md`.

## Quyết định đã chốt
Next.js App Router + TypeScript strict + Tailwind + Supabase (Auth, Postgres, Storage). React cho cả 6 game MVP; Phaser chưa cần. UI tiếng Việt, câu hỏi tiếng Anh. Chế độ khách và tài khoản.

## Quyết định còn mở
Tên thương hiệu chính thức, logo, domain, ngân sách hosting/audio, đăng nhập Google hay email, quyền sử dụng tài nguyên hình/âm thanh. Không tự giả định đã được phê duyệt.
