# DATN - Hệ thống Học Từ vựng Thông minh (Smart Vocabulary Learning System)

Chào mừng bạn đến với dự án **Hệ thống Học Từ vựng Thông minh**. Đây là đồ án tốt nghiệp (DATN) được xây dựng nhằm hỗ trợ người học tiếng Anh nâng cao vốn từ vựng thông qua các phương pháp học hiện đại như Spaced Repetition (Lặp lại ngắt quãng), học qua video, và tra cứu từ vựng tích hợp AI.

---

## 🌟 Tính năng nổi bật

### 1. Hệ thống Học Từ vựng (SRS)
- Áp dụng thuật toán **Spaced Repetition (SRS)** giúp tối ưu hóa thời gian ghi nhớ.
- Quản lý kho từ vựng cá nhân, theo dõi mức độ thông thạo (mastery level).
- Học qua Flashcards với giao diện trực quan.

### 2. Học qua Video (Video-based Learning)
- Tích hợp YouTube: Xem video kèm phụ đề tương tác.
- Tự động trích xuất phụ đề (Transcripts) và dịch nghĩa trực tiếp.
- Hỗ trợ tải video/phụ đề để học offline (sử dụng `yt-dlp` và `ffmpeg`).

### 3. Từ điển Thông minh (AI Dictionary)
- Tra cứu từ vựng trong văn bản/bài đọc.
- Tích hợp **OpenAI (GPT-4o-mini)** để phân tích ngữ cảnh và cung cấp giải thích từ vựng chính xác nhất.

### 4. Hệ thống Thanh toán & Premium
- Phân quyền người dùng (Free & Premium).
- Tích hợp cổng thanh toán **ZaloPay** để nâng cấp tài khoản.
- Giới hạn lượt tra cứu và lưu từ vựng cho người dùng miễn phí.

### 5. Quản trị & Hỗ trợ (Admin & Support)
- Dashboard quản trị người dùng, gói cước và nội dung.
- Hệ thống Ticket hỗ trợ người dùng trực tiếp trên ứng dụng.

---

## 🛠️ Công nghệ sử dụng

### Backend
- **Ngôn ngữ:** Java 17
- **Framework:** Spring Boot 4.0.4
- **Database:** MySQL
- **Lưu trữ Cloud:** Cloudinary (lưu trữ video/ảnh)
- **AI:** OpenAI API
- **Công cụ:** yt-dlp, ffmpeg (để xử lý video)

### Frontend
- **Framework:** React.js (Vite)
- **Styling:** Vanilla CSS
- **Routing:** React Router DOM

---

## 🚀 Hướng dẫn cài đặt

### 1. Yêu cầu hệ thống
- Java 17 hoặc cao hơn.
- Node.js (phiên bản mới nhất).
- MySQL Server.
- Cài đặt `ffmpeg` và `yt-dlp` vào máy (để sử dụng tính năng video).

### 2. Cấu hình Backend
- Di chuyển vào thư mục `backend`.
- Copy file `src/main/resources/application.properties.example` thành `application.properties`.
- Mở file `application.properties` và cập nhật các thông tin sau:
    - Cấu hình database (URL, Username, Password).
    - **OpenAI API Key**.
    - **Cloudinary Keys**.
    - **ZaloPay Sandbox Keys**.
    - Đường dẫn đến file `ffmpeg.exe` và `yt-dlp.exe` trên máy bạn.

### 3. Chạy Backend
```bash
# Trong thư mục backend
mvn clean install
mvn spring-boot:run
```

### 4. Chạy Frontend
```bash
# Trong thư mục frontend
npm install
npm run dev
```

---

## 📂 Cấu trúc thư mục
- `backend/`: Chứa toàn bộ mã nguồn Spring Boot.
- `frontend/`: Chứa mã nguồn React.js.
- `database/`: Các script SQL migrations.
- `docs/`: Tài liệu hướng dẫn và sơ đồ hệ thống.

---

## 🤝 Liên hệ
Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ qua hệ thống Support Ticket trong ứng dụng.
