-- Add deleted_at column for soft delete support
ALTER TABLE articles ADD COLUMN deleted_at DATETIME DEFAULT NULL;
ALTER TABLE videos ADD COLUMN deleted_at DATETIME DEFAULT NULL;
ALTER TABLE article_topics ADD COLUMN deleted_at DATETIME DEFAULT NULL;
ALTER TABLE youtube_channels ADD COLUMN deleted_at DATETIME DEFAULT NULL;
ALTER TABLE topics ADD COLUMN deleted_at DATETIME DEFAULT NULL;
ALTER TABLE lessons ADD COLUMN deleted_at DATETIME DEFAULT NULL;

-- Index for performance
CREATE INDEX idx_articles_deleted_at ON articles(deleted_at);
CREATE INDEX idx_videos_deleted_at ON videos(deleted_at);
CREATE INDEX idx_article_topics_deleted_at ON article_topics(deleted_at);
CREATE INDEX idx_channels_deleted_at ON youtube_channels(deleted_at);
CREATE INDEX idx_topics_deleted_at ON topics(deleted_at);
CREATE INDEX idx_lessons_deleted_at ON lessons(deleted_at);

-- Fix small columns and add missing fields
ALTER TABLE vocabulary MODIFY COLUMN example_vi TEXT;
ALTER TABLE article_topics MODIFY COLUMN article_topic_image TEXT;
ALTER TABLE topics MODIFY COLUMN topic_image TEXT;
ALTER TABLE lessons MODIFY COLUMN lesson_image TEXT;
ALTER TABLE lessons ADD COLUMN difficulty VARCHAR(255) DEFAULT 'Trung bình';
ALTER TABLE lessons MODIFY COLUMN status VARCHAR(255) DEFAULT 'Đang mở';
