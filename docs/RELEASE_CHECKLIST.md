# Production Release Checklist — English Game Hub MVP (Task T-018)

Checklist này là điều kiện tiên quyết trước khi đưa ứng dụng lên môi trường Production (Deploy/Monitoring/Rollback — Task T-019).

---

## 1. Codebase & Quality Gate

- [x] **Strict TypeScript Compilation:** Lệnh `npm run typecheck` (`tsc --noEmit`) đạt exit code 0 không có bất kỳ lỗi type nào.
- [x] **Linting Integrity:** Lệnh `npm run lint` đạt `No ESLint warnings or errors`.
- [x] **Automated Unit & Integration Tests:** Lệnh `npm run test` vượt qua 100% test suites (17 test files, > 200 tests).
- [x] **Next.js Production Build:** Lệnh `npm run build` biên dịch thành công, sinh tĩnh toàn bộ 16 routes tĩnh/động không có lỗi SSR.
- [x] **Bundle Size Optimization:** First Load JS shared by all routes đạt mức tối ưu ~103 kB, các route con từ 2 kB đến 21 kB.

---

## 2. Security & Environment Secrets

- [x] **Client-Side Secrets Scan:** Biến `SUPABASE_SERVICE_ROLE_KEY` tuyệt đối không xuất hiện trong mã nguồn client bundle (`src/app`, `src/components`, `src/games`).
- [x] **Row-Level Security (RLS) Verification:** 100% bảng trong `supabase/migrations/00001_initial_schema.sql` đã kích hoạt RLS và thiết lập policies phân quyền `auth.uid() = user_id`.
- [x] **Admin RBAC Enforcement:** Route `/admin/*` được bảo vệ 2 lớp (Middleware + Supabase RPC `is_admin`). Khách hoặc tài khoản người học thông thường bị từ chối truy cập.
- [x] **Open Redirect Protection:** Callback xác thực chỉ chấp nhận đường dẫn tương đối an toàn, chặn hoàn toàn các URL phishing bên ngoài.
- [x] **Zero-Leakage Invariant:** Schema nội dung của bài tập nghe `listen-choose` dùng Zod `.strict()` để chặn rò rỉ transcript trước khi người chơi nộp bài.

---

## 3. Data & Content Verification

- [x] **6 MVP Games Complete:** Cả 6 trò chơi (Picture Match, Memory Flip, Sentence Builder, Error Detective, Listen & Choose, Roleplay Simulator) đã hoàn tất Adapter, Renderer và Server Evaluator.
- [x] **Workplace English Pedagogy:** 100% câu hỏi đã qua biên tập (Editorial Review) có giải thích tiếng Việt súc tích (1–3 câu), gắn thẻ concept tags rõ ràng.
- [x] **Database Seed Synchronized:** Tệp `supabase/seed.sql` đã tích hợp đầy đủ câu hỏi mẫu, các chủ đề công sở và danh hiệu thành tích.
- [x] **Idempotent Scoring:** Chấm điểm và nộp bài sử dụng `requestId` để chống gian lận nộp trùng lặp (deduplication).

---

## 4. Accessibility & Mobile Responsiveness

- [x] **WCAG 2.1 AA Compliance:** Tỷ lệ tương phản màu sắc văn bản >= 4.5:1.
- [x] **Touch Target Size:** Vùng chạm cảm ứng đạt kích thước chuẩn tối thiểu 44x44px (`min-h-touch`) trên toàn bộ các nút bấm và thẻ bài.
- [x] **Full Keyboard Navigation:** Hỗ trợ đầy đủ phím số 1..4, phím Space, phím Enter, phím Backspace và phím Escape.
- [x] **Responsive Layouts:** Giao diện co giãn mượt mà trên các kích thước màn hình phổ biến (360px di động, 768px máy tính bảng, 1024px và 1440px máy tính).

---

## 5. Deployment & Rollback Readiness

- [x] **Environment Variables Checklist:**
  - `NEXT_PUBLIC_SUPABASE_URL` (Required)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Required)
  - `SUPABASE_SERVICE_ROLE_KEY` (Server-side only)
  - `NEXT_PUBLIC_APP_URL` (Required for Magic Link redirect)
- [x] **Rollback Plan Defined:** Trong trường hợp có sự cố sau khi deploy, rollback về commit Git ổn định trước đó hoặc kích hoạt chế độ bảo trì qua cờ `is_enabled` trong bảng `public.games`.

