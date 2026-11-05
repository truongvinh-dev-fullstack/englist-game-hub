# SRS — Software Requirements Specification

## Roles
- Guest: xem game/chủ đề, chơi và nhận kết quả cục bộ; không có đồng bộ đa thiết bị.
- Learner: toàn bộ quyền Guest + lịch sử, tiến độ và ôn tập đồng bộ.
- Admin: quản trị nội dung đã phân quyền; không được xem dữ liệu riêng tư ngoài nhu cầu vận hành được phê duyệt.

## Functional requirements
| ID | Yêu cầu | Ưu tiên | Acceptance |
|---|---|---|---|
| FR-01 | Xem kho game, lọc kỹ năng/chủ đề/độ khó | P0 | Filter cập nhật đúng, empty state rõ |
| FR-02 | Chơi khách | P0 | Vào chơi không cần login |
| FR-03 | Khởi tạo session | P0 | Session ID, seed, bộ câu hỏi hợp lệ |
| FR-04 | Nộp câu trả lời | P0 | Server chấm và trả feedback không lộ đáp án trước |
| FR-05 | Hoàn thành game | P0 | Result chính xác, finish idempotent |
| FR-06 | 6 game hoạt động | P0 | Test từng game theo GAME_RULES |
| FR-07 | Đăng ký/đăng nhập/đăng xuất | P0 | Session Auth đúng, route bảo vệ |
| FR-08 | Tiến độ người dùng | P0 | Đồng bộ theo tài khoản, guest lưu local tạm thời |
| FR-09 | Ôn lại câu sai | P0 | Tạo review item và mở được lượt ôn |
| FR-10 | Audio nghe | P0 | Phát, phát lại, loading/error/fallback |
| FR-11 | CMS CRUD và import | P0 | Validation, preview, rollback khi lỗi |
| FR-12 | Gợi ý game tiếp theo | P1 | Có đề xuất theo chủ đề/yếu điểm |
| FR-13 | Mục tiêu ngày | P1 | Cấu hình và theo dõi |

## Non-functional requirements
- Mobile-first, breakpoint 360px–desktop, không tràn ngang; touch target >=44px khi phù hợp.
- WCAG 2.2 AA là mục tiêu; keyboard focus, aria-label, thông báo đúng/sai không chỉ dùng màu.
- TypeScript strict, lint, unit/integration/e2e tests, không hardcode secret.
- Mục tiêu đo trên thiết bị mạng trung bình: LCP <=2.5s, INP <=200ms, CLS <=0.1 ở trang chính; cần đo thực tế, không bảo đảm mặc định.
- RLS cho dữ liệu cá nhân; admin server authorization; rate limit, input validation, audit log cho tác vụ admin.
- Dữ liệu tiếng Anh UTF-8; giờ lưu UTC, hiển thị theo múi giờ người dùng.

## Luồng ngoại lệ
Mất mạng khi chơi: thông báo, không mất câu đã trả lời trên client; đồng bộ lại khi có mạng nếu session hợp lệ. Refresh: khôi phục session nếu có; không cộng XP hai lần. Audio lỗi: có transcript hoặc lựa chọn bỏ qua với trạng thái rõ. Guest xóa cache: có thể mất tiến độ, thông báo trước.
