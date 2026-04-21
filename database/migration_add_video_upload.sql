-- ============================================================
-- Migration: Thêm cột hỗ trợ upload video trực tiếp
-- Chạy file này trên database mysql để cập nhật bảng videos
-- ============================================================

-- Thêm cột lưu đường dẫn file video trên server
ALTER TABLE videos
    ADD COLUMN IF NOT EXISTS file_path VARCHAR(500) NULL
    COMMENT 'Đường dẫn tuyệt đối đến file video trên server';

-- Thêm cột theo dõi trạng thái tạo phụ đề tự động
-- Giá trị: PENDING / PROCESSING / DONE / ERROR
ALTER TABLE videos
    ADD COLUMN IF NOT EXISTS subtitle_status VARCHAR(50) NULL DEFAULT 'PENDING'
    COMMENT 'Trạng thái tạo phụ đề: PENDING, PROCESSING, DONE, ERROR';
