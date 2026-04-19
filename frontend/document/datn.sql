-- =========================================
-- DATABASE: VOCAB LEARNING SYSTEM
-- =========================================
DROP DATABASE IF EXISTS vocab_learning;
CREATE DATABASE vocab_learning;
USE vocab_learning;

-- =========================================
-- USERS
-- =========================================
CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Khóa chính định danh người dùng',
    username VARCHAR(50) UNIQUE COMMENT 'Tên đăng nhập duy nhất',
    email VARCHAR(100) UNIQUE COMMENT 'Email người dùng',
    password VARCHAR(255) COMMENT 'Mật khẩu đã mã hóa',
    role VARCHAR(20) DEFAULT 'USER' COMMENT 'Phân quyền: USER hoặc ADMIN',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Trạng thái tài khoản',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo tài khoản',
    deleted_at DATETIME NULL COMMENT 'Thời gian xóa mềm tài khoản'
);

CREATE TABLE User_Profile (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID profile',
    user_id INT UNIQUE COMMENT 'Mỗi user chỉ có một hồ sơ',
    full_name VARCHAR(100) COMMENT 'Họ tên người dùng',
    avatar VARCHAR(255) COMMENT 'Ảnh đại diện',
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- =========================================
-- PREMIUM
-- =========================================
CREATE TABLE Premium_Plans (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID gói Premium',
    name VARCHAR(100) COMMENT 'Tên gói',
    price DECIMAL(10,2) COMMENT 'Giá tiền',
    duration INT COMMENT 'Thời hạn (ngày)',
    description TEXT COMMENT 'Mô tả gói'
);

CREATE TABLE User_Subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID đăng ký',
    user_id INT NOT NULL COMMENT 'Người dùng',
    plan_id INT NOT NULL COMMENT 'Gói Premium',
    start_date DATETIME COMMENT 'Ngày bắt đầu',
    end_date DATETIME COMMENT 'Ngày kết thúc',
    status VARCHAR(50) COMMENT 'Trạng thái',
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (plan_id) REFERENCES Premium_Plans(id)
);

CREATE TABLE Transactions (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID giao dịch',
    user_id INT COMMENT 'Người thanh toán',
    subscription_id INT COMMENT 'Gói liên quan',
    amount DECIMAL(10,2) COMMENT 'Số tiền',
    payment_method VARCHAR(50) COMMENT 'Phương thức thanh toán',
    status VARCHAR(50) COMMENT 'Trạng thái',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian',
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (subscription_id) REFERENCES User_Subscriptions(id)
);

CREATE TABLE Premium_Audit_Logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    transaction_id INT NULL,
    subscription_id INT NULL,
    action VARCHAR(50) NOT NULL,
    status_before VARCHAR(50) NULL,
    status_after VARCHAR(50) NULL,
    reason TEXT NULL,
    admin_actor VARCHAR(100) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (transaction_id) REFERENCES Transactions(id),
    FOREIGN KEY (subscription_id) REFERENCES User_Subscriptions(id)
);

-- =========================================
-- CONTENT
-- =========================================
CREATE TABLE Topics (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID chủ đề',
    name VARCHAR(100) COMMENT 'Tên chủ đề',
    description TEXT COMMENT 'Mô tả',
    level VARCHAR(50) COMMENT 'Mức độ',
    status BOOLEAN DEFAULT TRUE COMMENT 'Trạng thái'
);

CREATE TABLE Lessons (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID bài học',
    topic_id INT COMMENT 'Thuộc chủ đề',
    name VARCHAR(100) COMMENT 'Tên bài học',
    description TEXT COMMENT 'Mô tả',
    FOREIGN KEY (topic_id) REFERENCES Topics(id) ON DELETE CASCADE
);

CREATE TABLE Vocabulary (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID từ vựng',
    word VARCHAR(100) UNIQUE COMMENT 'Từ tiếng Anh',
    pronunciation VARCHAR(100) COMMENT 'Phiên âm',
    part_of_speech VARCHAR(50) COMMENT 'Loại từ',
    meaning_en TEXT COMMENT 'Định nghĩa tiếng Anh',
    meaning_vi TEXT COMMENT 'Nghĩa tiếng Việt',
    example TEXT COMMENT 'Câu ví dụ',
    level VARCHAR(50) COMMENT 'Độ khó',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo'
);

-- Bảng trung gian nhiều-nhiều
CREATE TABLE Lesson_Vocabulary (
    lesson_id INT COMMENT 'ID bài học',
    vocab_id INT COMMENT 'ID từ vựng',
    PRIMARY KEY (lesson_id, vocab_id),
    FOREIGN KEY (lesson_id) REFERENCES Lessons(id) ON DELETE CASCADE,
    FOREIGN KEY (vocab_id) REFERENCES Vocabulary(id) ON DELETE CASCADE
);

-- =========================================
-- ARTICLES & VIDEOS
-- =========================================
CREATE TABLE Articles (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID bài viết',
    title VARCHAR(255) COMMENT 'Tiêu đề',
    content TEXT COMMENT 'Nội dung',
    source VARCHAR(255) COMMENT 'Nguồn',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tạo'
);

CREATE TABLE Videos (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID video',
    title VARCHAR(255) COMMENT 'Tiêu đề',
    url VARCHAR(255) COMMENT 'Link video',
    transcript TEXT COMMENT 'Phụ đề'
);

-- =========================================
-- USER CUSTOM VOCAB
-- =========================================
CREATE TABLE User_Vocabulary_Custom (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID từ do user thêm',
    user_id INT COMMENT 'Người thêm',
    word VARCHAR(100) COMMENT 'Từ vựng',
    pronunciation VARCHAR(100),
    part_of_speech VARCHAR(50),
    meaning_en TEXT,
    meaning_vi TEXT,
    example TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- =========================================
-- SPACED REPETITION CORE
-- =========================================
CREATE TABLE User_Vocabulary_Learning (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID trạng thái học',

    user_id INT NOT NULL COMMENT 'Người học',

    vocab_id INT NULL COMMENT 'Từ hệ thống',
    custom_vocab_id INT NULL COMMENT 'Từ user',

    streak_correct INT DEFAULT 0 COMMENT 'Số lần đúng liên tiếp (h)',

    last_review DATETIME COMMENT 'Lần ôn gần nhất (d)',
    next_review DATETIME COMMENT 'Lịch ôn tiếp theo',

    difficulty FLOAT DEFAULT 2.5 COMMENT 'Độ khó hiện tại (c)',
    base_difficulty FLOAT DEFAULT 2.5 COMMENT 'Độ khó ban đầu',

    total_attempts INT DEFAULT 0 COMMENT 'Tổng số lần học',
    total_errors INT DEFAULT 0 COMMENT 'Số lần sai',

    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (vocab_id) REFERENCES Vocabulary(id) ON DELETE CASCADE,
    FOREIGN KEY (custom_vocab_id) REFERENCES User_Vocabulary_Custom(id) ON DELETE CASCADE,

    UNIQUE (user_id, vocab_id),
    UNIQUE (user_id, custom_vocab_id),

    CHECK (
        (vocab_id IS NOT NULL AND custom_vocab_id IS NULL)
        OR (vocab_id IS NULL AND custom_vocab_id IS NOT NULL)
    )
);

-- =========================================
-- REVIEW
-- =========================================
CREATE TABLE Review_History (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Lịch sử ôn tập',
    user_id INT COMMENT 'Người học',
    vocab_id INT NULL,
    custom_vocab_id INT NULL,
    is_correct BOOLEAN COMMENT 'Kết quả',
    response_time FLOAT COMMENT 'Thời gian trả lời',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (vocab_id) REFERENCES Vocabulary(id),
    FOREIGN KEY (custom_vocab_id) REFERENCES User_Vocabulary_Custom(id)
);

CREATE TABLE Review_Sessions (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Phiên học',
    user_id INT,
    total_questions INT,
    correct_answers INT,
    accuracy FLOAT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- =========================================
-- CONFIG
-- =========================================
CREATE TABLE Spaced_Config (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Cấu hình thuật toán',
    beta_0 FLOAT DEFAULT 2.5 COMMENT 'Bias logistic',
    beta_1 FLOAT DEFAULT 1.0 COMMENT 'Trọng số h',
    beta_2 FLOAT DEFAULT 0.5 COMMENT 'Trọng số d',
    beta_3 FLOAT DEFAULT 0.8 COMMENT 'Trọng số c',
    K INT DEFAULT 10 COMMENT 'Bayesian smoothing',
    max_interval INT DEFAULT 30 COMMENT 'Khoảng cách tối đa'
);

-- =========================================
-- GAMIFICATION
-- =========================================
CREATE TABLE Leaderboard (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    score INT,
    rank INT,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- =========================================
-- STATS
-- =========================================
CREATE TABLE User_Stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    total_words INT,
    learned_words INT,
    accuracy FLOAT,
    streak_days INT,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- =========================================
-- SUPPORT
-- =========================================
CREATE TABLE Support_Tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    title VARCHAR(255),
    message TEXT,
    status VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

CREATE TABLE Support_Responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT,
    admin_id INT,
    response TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES Support_Tickets(id),
    FOREIGN KEY (admin_id) REFERENCES Users(id)
);

-- =========================================
-- INDEX
-- =========================================

-- Tối ưu truy vấn lấy từ cần ôn
CREATE INDEX idx_user_next_review 
ON User_Vocabulary_Learning(user_id, next_review);

-- Tra từ nhanh
CREATE INDEX idx_vocab_word 
ON Vocabulary(word);

-- Join nhanh
CREATE INDEX idx_user_vocab 
ON User_Vocabulary_Learning(user_id, vocab_id);

-- Lịch sử học
CREATE INDEX idx_review_user 
ON Review_History(user_id);

CREATE INDEX idx_users_deleted_at
ON Users(deleted_at);

CREATE INDEX idx_premium_audit_action
ON Premium_Audit_Logs(action);

CREATE INDEX idx_premium_audit_created_at
ON Premium_Audit_Logs(created_at);