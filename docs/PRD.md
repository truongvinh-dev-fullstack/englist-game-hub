# PRD — Product Requirements Document

## 1. Bài toán
Người đi làm thiếu thời gian, khó duy trì việc học; nội dung tiếng Anh cần ứng dụng vào công sở và đời sống. Giải pháp là thư viện mini game độc lập, có gợi ý học, phản hồi tức thời và ôn lại lỗi sai.

## 2. Persona
- Người mới đi làm mất gốc: cần câu ngắn, hướng dẫn tiếng Việt, không áp lực.
- Nhân viên văn phòng A1–A2: cần email, cuộc họp, trao đổi lịch và gọi điện.
- Người đi làm A2–B1: muốn phản xạ giao tiếp tình huống thực tế.

## 3. Jobs-to-be-done
- Trong 5 phút nghỉ, mở web và hoàn thành một lượt chơi.
- Khi sai, hiểu tại sao và ôn lại trong trò khác.
- Xem tiến bộ theo kỹ năng mà không cần đọc báo cáo dài.

## 4. In scope MVP
- Landing/dashboard, game library, topics, game detail, play, results, review, progress, profile/login, admin tối thiểu.
- 6 game, classic mode; lọc theo chủ đề, kỹ năng, độ khó.
- Chơi khách không cần đăng nhập; tài khoản lưu tiến trình xuyên thiết bị.
- XP, kết quả, lịch sử câu sai, ôn tập cơ bản.
- Audio có nút phát lại, xử lý lỗi và phương án fallback.
- CMS CRUD nội dung, nhập CSV với preview và validation.

## 5. Out of scope
AI chat tự do, chấm phát âm, realtime multiplayer, marketplace, native mobile, RPG map, bảng xếp hạng công khai, thanh toán, chế độ tính giờ bắt buộc.

## 6. KPI thử nghiệm (mục tiêu giả định, cần hiệu chỉnh)
- >= 60% người truy cập kho game bắt đầu một lượt.
- >= 70% lượt chơi đã bắt đầu được hoàn thành.
- >= 95% lượt chơi hoàn thành lưu kết quả thành công.
- Median thời gian đến khi bắt đầu chơi <= 30 giây.
- Theo dõi retention D1/D7; chưa áp chỉ tiêu cứng trước beta.

## 7. Rủi ro
Nội dung sai, câu hỏi quá khó, lộ đáp án, gian lận XP, thiếu bản quyền audio/ảnh, dữ liệu khách mất khi đổi thiết bị. Cần quy trình kiểm duyệt và cảnh báo rõ ràng.
