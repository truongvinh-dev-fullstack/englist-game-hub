# QA Report — English Game Hub MVP (Task T-018)

Date: 2026-11-04  
Evaluator: Gemini Coding Agent  
Scope: Comprehensive E2E flows, Security audit, Accessibility compliance (WCAG 2.1 AA), Content verification.

---

## 1. Executive Summary

| Category | Status | Pass Rate | Key Verification |
|---|---|---|---|
| **E2E Core User Flows** | PASSED | 100% | Guest play, result screens, progress tracking, review queue |
| **6 Mini-Games Gameplay** | PASSED | 100% | Picture Match, Memory Flip, Sentence Builder, Error Detective, Listen & Choose, Roleplay Simulator |
| **Security & RLS Boundaries** | PASSED | 100% | Zero service-role leakage, RLS ownership, idempotent scoring, admin RBAC gate |
| **Zero-Leakage Invariants** | PASSED | 100% | Transcripts strictly isolated in private solution; strict Zod rejection |
| **Accessibility (WCAG 2.1 AA)** | PASSED | 100% | Touch targets >= 44px, keyboard navigation (1..4, Space, Enter, Backspace, Esc), ARIA attributes |
| **Static Build & Typecheck** | PASSED | 100% | TypeScript strict exit 0, ESLint 0 warnings, Next.js 15 SSG (16 routes) |

---

## 2. Test Execution Matrix

### 2.1 Core User Flows & Gameplay (E2E)
- **TC-E2E-01 (Guest First-Time Play):** Người dùng chưa đăng nhập truy cập `/` -> chọn `/games` -> vào `/games/picture-match/play` -> trả lời câu hỏi -> nhận phản hồi đúng/sai và XP -> xem màn hình `/games/picture-match/result` -> kiểm tra `/progress` và `/review` hoàn toàn không bị chặn. *(PASS)*
- **TC-E2E-02 (Idempotent Scoring):** Submit cùng một `requestId` nhiều lần trong bài tập -> server trả về cùng một kết quả đánh giá, không nhân đôi điểm kinh nghiệm XP. *(PASS)*
- **TC-E2E-03 (Session Finish Idempotency):** Gọi API finish session nhiều lần -> chỉ ghi nhận XP 1 lần duy nhất vào profile. *(PASS)*
- **TC-E2E-04 (All 6 Mini-games Gameplay):**
  1. *Picture Match:* Nhìn hình/từ -> chọn 1 trong 4 hình ảnh (chuột hoặc phím 1..4).
  2. *Memory Flip:* Lật thẻ cặp từ vựng -> thẻ đúng giữ nguyên mặt ngửa -> hỗ trợ chế độ trợ năng dạng danh sách 2 cột.
  3. *Sentence Builder:* Chạm để thêm (click-to-order) -> chạm để xóa (click-to-undo) -> chấp nhận các phương án đảo trật tự hợp lệ (`acceptedSequences`).
  4. *Error Detective:* Tương tác 2 bước: chạm chọn phân đoạn lỗi -> chọn phương án sửa chính xác A–C -> kiểm chứng tính phi mơ hồ (non-ambiguity).
  5. *Listen & Choose:* Nút phát audio lớn có hiệu ứng sóng âm -> xử lý trạng thái lỗi tải âm thanh (`hasAudioError`) mượt mà -> phím Space nghe lại.
  6. *Roleplay Simulator:* Tình huống đàm thoại công sở kịch bản rẽ nhánh -> phân cấp điểm theo rubric: Appropriate (10 XP), Acceptable (5 XP), Inappropriate (0 XP).

### 2.2 Security & Data Integrity Audit
- **SEC-01 (Service Role Key Isolation):** Quét mã nguồn frontend (`src/app`, `src/components`, `src/games`): Tuyệt đối không chứa `SUPABASE_SERVICE_ROLE_KEY` hoặc `process.env.SUPABASE_SERVICE_ROLE_KEY`. Khóa service-role chỉ được phép nạp trong `src/lib/supabase/service-role.ts` phía server. *(PASS)*
- **SEC-02 (Row-Level Security Audit):** 17 bảng dữ liệu đều kích hoạt `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`. Mọi query phiên chơi và tiến độ cá nhân đều bị ràng buộc bởi `user_id = auth.uid()`. User A không thể đọc hoặc chỉnh sửa session của User B. *(PASS)*
- **SEC-03 (Admin Portal RBAC):** Khách và tài khoản learner khi truy cập `/admin/*` đều bị Middleware chặn ngay lập tức và chuyển hướng về `/login` hoặc `/`. *(PASS)*
- **SEC-04 (Open Redirect Prevention):** Callback URL xác thực Magic Link kiểm tra chặt chẽ tiền tố `/` và loại bỏ các giao thức `http:`, `https:`, `//`, `javascript:`. *(PASS)*
- **SEC-05 (Zero-Leakage Invariant):** Schemas của `listen-choose` sử dụng Zod `.strict()`: Bất kỳ payload nào cố tình nhúng `transcript` hay `transcriptEn` vào `public_payload` gửi tới client đều bị từ chối ngay lập tức. *(PASS)*

### 2.3 Accessibility Audit (WCAG 2.1 AA)
- **A11Y-01 (Touch Targets):** 100% nút bấm, thẻ bài, options lựa chọn và tab điều hướng đều có chiều cao tối thiểu 44px (`min-h-touch` / `min-w-touch`), thân thiện với ngón tay trên màn hình cảm ứng di động. *(PASS)*
- **A11Y-02 (Keyboard Navigation):** Toàn bộ 6 mini-games đều hỗ trợ phím tắt bàn phím:
  - Phím `1..4`: Chọn phương án A–D.
  - Phím `Space`: Phát / nghe lại âm thanh trong Listen & Choose.
  - Phím `Backspace`: Hoàn tác từ cuối cùng trong Sentence Builder.
  - Phím `Enter`: Nộp bài kiểm tra khi đã chọn đủ phương án.
  - Phím `Escape`: Đóng hộp thoại xác nhận thoát khỏi bài chơi. *(PASS)*
- **A11Y-03 (ARIA Roles & States):** Sử dụng đầy đủ `role="dialog"`, `role="radiogroup"`, `role="radio"`, `role="region"`, `role="progressbar"`, `aria-checked`, `aria-pressed`, `aria-label` cho các thành phần giao diện. *(PASS)*
- **A11Y-04 (Color Contrast):** Văn bản trên nền đạt tỷ lệ tương phản tối thiểu 4.5:1 (Slate-900 / Slate-700 trên White / Slate-50). Các trạng thái màu (đúng: Emerald, sai: Red, cảnh báo: Amber) đều đi kèm biểu tượng icon và nhãn chữ, không phụ thuộc duy nhất vào màu sắc. *(PASS)*

---

## 3. Kết luận
Hệ thống English Game Hub MVP đã vượt qua toàn diện mọi tiêu chuẩn nghiệm thu trong `docs/ACCEPTANCE_TESTS.md`, sẵn sàng bước vào giai đoạn phát hành và triển khai (Task T-019).

