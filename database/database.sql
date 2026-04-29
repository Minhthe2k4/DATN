-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: vocab_learning
-- ------------------------------------------------------
-- Server version	5.7.44-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `article_topics`
--

DROP TABLE IF EXISTS `article_topics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `article_topics` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID chủ đề bài báo',
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci COMMENT 'Mô tả',
  `level` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `article_topic_image` text COLLATE utf8mb4_unicode_ci,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_topics_deleted_at` (`deleted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `articles`
--

DROP TABLE IF EXISTS `articles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `articles` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Tiêu đề',
  `content` text COLLATE utf8mb4_unicode_ci COMMENT 'Nội dung',
  `source` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nguồn bài viết',
  `topic_id` int(11) DEFAULT NULL COMMENT 'Chủ đề bài viết',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày tạo',
  `difficulty` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `words_highlighted` int(11) NOT NULL DEFAULT '0',
  `status` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `article_image` text COLLATE utf8mb4_unicode_ci,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `topic_id` (`topic_id`),
  KEY `idx_articles_deleted_at` (`deleted_at`),
  CONSTRAINT `articles_ibfk_1` FOREIGN KEY (`topic_id`) REFERENCES `article_topics` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `flashcard_decks`
--

DROP TABLE IF EXISTS `flashcard_decks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flashcard_decks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `folder_id` int(11) DEFAULT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_deck_user` (`user_id`),
  KEY `fk_deck_folder` (`folder_id`),
  CONSTRAINT `fk_deck_folder` FOREIGN KEY (`folder_id`) REFERENCES `flashcard_folders` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_deck_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `flashcard_folders`
--

DROP TABLE IF EXISTS `flashcard_folders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flashcard_folders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_folder_user` (`user_id`),
  CONSTRAINT `fk_folder_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `flashcards`
--

DROP TABLE IF EXISTS `flashcards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flashcards` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `deck_id` int(11) NOT NULL,
  `custom_vocab_id` int(11) DEFAULT NULL,
  `front_text` text COLLATE utf8mb4_unicode_ci,
  `back_text` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_card_deck` (`deck_id`),
  KEY `fk_card_custom_vocab` (`custom_vocab_id`),
  CONSTRAINT `fk_card_custom_vocab` FOREIGN KEY (`custom_vocab_id`) REFERENCES `user_vocabulary_custom` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_card_deck` FOREIGN KEY (`deck_id`) REFERENCES `flashcard_decks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `leaderboard`
--

DROP TABLE IF EXISTS `leaderboard`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leaderboard` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL COMMENT 'Người dùng',
  `score` int(11) DEFAULT NULL COMMENT 'Điểm',
  `rank` int(11) DEFAULT NULL COMMENT 'Xếp hạng',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `leaderboard_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lesson_vocabulary`
--

DROP TABLE IF EXISTS `lesson_vocabulary`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lesson_vocabulary` (
  `lesson_id` int(11) NOT NULL COMMENT 'ID bài học',
  `vocab_id` int(11) NOT NULL COMMENT 'ID từ vựng',
  PRIMARY KEY (`lesson_id`,`vocab_id`),
  KEY `vocab_id` (`vocab_id`),
  CONSTRAINT `lesson_vocabulary_ibfk_1` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lesson_vocabulary_ibfk_2` FOREIGN KEY (`vocab_id`) REFERENCES `vocabulary` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lessons`
--

DROP TABLE IF EXISTS `lessons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lessons` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID bài học',
  `topic_id` int(11) DEFAULT NULL COMMENT 'Thuộc chủ đề',
  `name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci COMMENT 'Mô tả',
  `status` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'Đang mở',
  `lesson_image` text COLLATE utf8mb4_unicode_ci,
  `deleted_at` datetime DEFAULT NULL,
  `difficulty` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'Trung bình',
  `is_premium` bit(1) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `topic_id` (`topic_id`),
  KEY `idx_lessons_deleted_at` (`deleted_at`),
  CONSTRAINT `lessons_ibfk_1` FOREIGN KEY (`topic_id`) REFERENCES `topics` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lookup_history`
--

DROP TABLE IF EXISTS `lookup_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lookup_history` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `word` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `article_id` bigint(20) DEFAULT NULL,
  `sentence` text COLLATE utf8mb4_unicode_ci,
  `definitions_json` json DEFAULT NULL,
  `selected_index` bigint(20) DEFAULT NULL,
  `meaning_vi` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `context_translation` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `idx_lookup_user` (`user_id`),
  KEY `idx_lookup_word` (`word`),
  KEY `fk_lookup_article` (`article_id`),
  CONSTRAINT `fk_lookup_article` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_lookup_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=108 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `premium_audit_logs`
--

DROP TABLE IF EXISTS `premium_audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `premium_audit_logs` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `transaction_id` bigint(20) DEFAULT NULL,
  `subscription_id` int(11) DEFAULT NULL,
  `action` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status_before` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status_after` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci,
  `admin_actor` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_premium_audit_user_id` (`user_id`),
  KEY `idx_premium_audit_transaction_id` (`transaction_id`),
  KEY `idx_premium_audit_subscription_id` (`subscription_id`),
  KEY `idx_premium_audit_action` (`action`),
  KEY `idx_premium_audit_created_at` (`created_at`),
  CONSTRAINT `fk_premium_audit_subscription` FOREIGN KEY (`subscription_id`) REFERENCES `user_subscriptions` (`id`),
  CONSTRAINT `fk_premium_audit_transaction` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`),
  CONSTRAINT `fk_premium_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `premium_feature_limits`
--

DROP TABLE IF EXISTS `premium_feature_limits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `premium_feature_limits` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `plan_id` int(11) DEFAULT NULL,
  `feature_name` varchar(100) NOT NULL,
  `is_locked` tinyint(1) DEFAULT '0',
  `usage_limit` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_plan_feature_limits` (`plan_id`),
  CONSTRAINT `fk_plan_feature_limits` FOREIGN KEY (`plan_id`) REFERENCES `premium_plans` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=384 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `premium_plans`
--

DROP TABLE IF EXISTS `premium_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `premium_plans` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID gói Premium',
  `name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` double DEFAULT NULL,
  `duration` int(11) DEFAULT NULL COMMENT 'Thời hạn (ngày)',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT 'Mô tả gói',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `review_history`
--

DROP TABLE IF EXISTS `review_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `review_history` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL COMMENT 'Người học',
  `vocab_id` int(11) DEFAULT NULL COMMENT 'Từ hệ thống',
  `custom_vocab_id` int(11) DEFAULT NULL COMMENT 'Từ user',
  `is_correct` tinyint(1) DEFAULT NULL COMMENT 'Đúng/Sai',
  `response_time` float DEFAULT NULL COMMENT 'Thời gian trả lời',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian',
  `session_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `vocab_id` (`vocab_id`),
  KEY `custom_vocab_id` (`custom_vocab_id`),
  KEY `idx_review_user` (`user_id`),
  KEY `FK78njllox2dutt13g7whss9mh2` (`session_id`),
  CONSTRAINT `FK78njllox2dutt13g7whss9mh2` FOREIGN KEY (`session_id`) REFERENCES `review_sessions` (`id`),
  CONSTRAINT `review_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `review_history_ibfk_2` FOREIGN KEY (`vocab_id`) REFERENCES `vocabulary` (`id`),
  CONSTRAINT `review_history_ibfk_3` FOREIGN KEY (`custom_vocab_id`) REFERENCES `user_vocabulary_custom` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=76 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `review_sessions`
--

DROP TABLE IF EXISTS `review_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `review_sessions` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL COMMENT 'Người học',
  `total_questions` int(11) DEFAULT NULL COMMENT 'Tổng câu hỏi',
  `correct_answers` int(11) DEFAULT NULL COMMENT 'Số câu đúng',
  `accuracy` float DEFAULT NULL COMMENT 'Độ chính xác',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `review_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `segments`
--

DROP TABLE IF EXISTS `segments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `segments` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `segment_order` bigint(20) DEFAULT NULL COMMENT 'Thứ tự segment',
  `start_sec` double DEFAULT NULL COMMENT 'Thời gian bắt đầu (giây)',
  `end_sec` double DEFAULT NULL COMMENT 'Thời gian kết thúc (giây)',
  `text` text COLLATE utf8mb4_unicode_ci COMMENT 'Nội dung phụ đề',
  `video_id` bigint(20) DEFAULT NULL COMMENT 'Video ID',
  PRIMARY KEY (`id`),
  KEY `video_id` (`video_id`),
  CONSTRAINT `segments_ibfk_1` FOREIGN KEY (`video_id`) REFERENCES `videos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=526 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `spaced_config`
--

DROP TABLE IF EXISTS `spaced_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `spaced_config` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `beta_0` float DEFAULT '2.5' COMMENT 'Bias',
  `beta_1` float DEFAULT '1' COMMENT 'Trọng số streak',
  `beta_2` float DEFAULT '0.5' COMMENT 'Trọng số thời gian',
  `beta_3` float DEFAULT '0.8' COMMENT 'Trọng số độ khó',
  `beta_4` float DEFAULT '0.5',
  `K` int(11) DEFAULT '10' COMMENT 'Hệ số smoothing',
  `max_interval` int(11) DEFAULT '30' COMMENT 'Khoảng ôn tối đa (ngày)',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `support_responses`
--

DROP TABLE IF EXISTS `support_responses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `support_responses` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `ticket_id` int(11) DEFAULT NULL COMMENT 'Ticket liên quan',
  `admin_id` int(11) DEFAULT NULL COMMENT 'Admin phản hồi',
  `response` text COLLATE utf8mb4_unicode_ci COMMENT 'Nội dung',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian',
  PRIMARY KEY (`id`),
  KEY `ticket_id` (`ticket_id`),
  KEY `admin_id` (`admin_id`),
  CONSTRAINT `support_responses_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `support_tickets` (`id`),
  CONSTRAINT `support_responses_ibfk_2` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `support_tickets`
--

DROP TABLE IF EXISTS `support_tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `support_tickets` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID ticket',
  `user_id` int(11) DEFAULT NULL COMMENT 'Người gửi',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Tiêu đề',
  `message` text COLLATE utf8mb4_unicode_ci COMMENT 'Nội dung',
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian',
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sender_name` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `support_tickets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `topics`
--

DROP TABLE IF EXISTS `topics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `topics` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID chủ đề',
  `name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci COMMENT 'Mô tả',
  `level` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint(1) DEFAULT '1' COMMENT 'Trạng thái hoạt động',
  `created_at` datetime(6) DEFAULT NULL,
  `topic_image` text COLLATE utf8mb4_unicode_ci,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_topics_deleted_at` (`deleted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL COMMENT 'Người thanh toán',
  `subscription_id` int(11) DEFAULT NULL COMMENT 'Gói liên quan',
  `amount` double DEFAULT NULL,
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian giao dịch',
  `vnp_txn_ref` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `plan_id` bigint(20) DEFAULT NULL,
  `payment_trans_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `subscription_id` (`subscription_id`),
  CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`subscription_id`) REFERENCES `user_subscriptions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=78 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_favorites`
--

DROP TABLE IF EXISTS `user_favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_favorites` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `target_id` bigint(20) DEFAULT NULL,
  `target_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_favorite` (`user_id`,`target_id`,`target_type`),
  CONSTRAINT `fk_uf_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_profile`
--

DROP TABLE IF EXISTS `user_profile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_profile` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL COMMENT 'Liên kết với Users (1-1)',
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ảnh đại diện',
  `created_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `user_profile_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_progress`
--

DROP TABLE IF EXISTS `user_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_progress` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `target_id` bigint(20) DEFAULT NULL,
  `target_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `progress_percent` double DEFAULT '0',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_progress` (`user_id`,`target_id`,`target_type`),
  CONSTRAINT `fk_up_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_stats`
--

DROP TABLE IF EXISTS `user_stats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_stats` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL COMMENT 'Người dùng',
  `total_words` int(11) DEFAULT NULL COMMENT 'Tổng số từ',
  `learned_words` int(11) DEFAULT NULL COMMENT 'Số từ đã học',
  `accuracy` float DEFAULT NULL COMMENT 'Độ chính xác',
  `streak_days` int(11) DEFAULT NULL COMMENT 'Số ngày học liên tiếp',
  `total_study_time` float DEFAULT NULL,
  `last_review_notification` datetime DEFAULT NULL,
  `last_study_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_stats_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_subscriptions`
--

DROP TABLE IF EXISTS `user_subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_subscriptions` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID đăng ký',
  `user_id` int(11) NOT NULL COMMENT 'Người đăng ký',
  `plan_id` int(11) NOT NULL COMMENT 'Gói Premium',
  `start_date` datetime DEFAULT NULL COMMENT 'Ngày bắt đầu',
  `end_date` datetime DEFAULT NULL COMMENT 'Ngày kết thúc',
  `status` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_premium` tinyint(1) DEFAULT '0',
  `daily_lookup_count` int(11) DEFAULT '0',
  `last_lookup_date` datetime DEFAULT NULL,
  `daily_download_count` int(11) DEFAULT NULL,
  `last_download_date` datetime DEFAULT NULL,
  `daily_video_download_count` int(11) DEFAULT NULL,
  `last_video_download_date` datetime DEFAULT NULL,
  `monthly_test_count` int(11) DEFAULT NULL,
  `last_test_date` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `plan_id` (`plan_id`),
  CONSTRAINT `user_subscriptions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `user_subscriptions_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `premium_plans` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_vocabulary_custom`
--

DROP TABLE IF EXISTS `user_vocabulary_custom`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_vocabulary_custom` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID từ tự thêm',
  `user_id` int(11) DEFAULT NULL COMMENT 'Người tạo',
  `word` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pronunciation` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `part_of_speech` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meaning_en` text COLLATE utf8mb4_unicode_ci COMMENT 'Nghĩa tiếng Anh',
  `meaning_vi` text COLLATE utf8mb4_unicode_ci COMMENT 'Nghĩa tiếng Việt',
  `example` text COLLATE utf8mb4_unicode_ci COMMENT 'Ví dụ',
  `example_vi` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày tạo',
  `source_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source_id` bigint(20) DEFAULT NULL,
  `level` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `level_source` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_vocabulary_custom_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_vocabulary_learning`
--

DROP TABLE IF EXISTS `user_vocabulary_learning`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_vocabulary_learning` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL COMMENT 'Người học',
  `vocab_id` int(11) DEFAULT NULL COMMENT 'Từ hệ thống',
  `custom_vocab_id` int(11) DEFAULT NULL COMMENT 'Từ tự thêm',
  `streak_correct` int(11) DEFAULT '0' COMMENT 'Số lần trả lời đúng liên tiếp',
  `last_review` datetime DEFAULT NULL COMMENT 'Lần ôn gần nhất',
  `next_review` datetime DEFAULT NULL COMMENT 'Lịch ôn tiếp theo',
  `difficulty` float DEFAULT '2.5' COMMENT 'Độ khó hiện tại',
  `base_difficulty` float DEFAULT '2.5' COMMENT 'Độ khó ban đầu',
  `total_attempts` int(11) DEFAULT '0' COMMENT 'Tổng số lần học',
  `total_errors` int(11) DEFAULT '0' COMMENT 'Số lần sai',
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`,`vocab_id`),
  UNIQUE KEY `user_id_2` (`user_id`,`custom_vocab_id`),
  KEY `vocab_id` (`vocab_id`),
  KEY `custom_vocab_id` (`custom_vocab_id`),
  KEY `idx_user_next_review` (`user_id`,`next_review`),
  KEY `idx_user_vocab` (`user_id`,`vocab_id`),
  CONSTRAINT `user_vocabulary_learning_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_vocabulary_learning_ibfk_2` FOREIGN KEY (`vocab_id`) REFERENCES `vocabulary` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_vocabulary_learning_ibfk_3` FOREIGN KEY (`custom_vocab_id`) REFERENCES `user_vocabulary_custom` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID người dùng',
  `username` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Tên đăng nhập (duy nhất)',
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Email người dùng',
  `password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Mật khẩu đã mã hóa',
  `role` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1' COMMENT 'Trạng thái hoạt động',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày tạo tài khoản',
  `deleted_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `videos`
--

DROP TABLE IF EXISTS `videos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `videos` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Tiêu đề',
  `url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Link video',
  `transcript` text COLLATE utf8mb4_unicode_ci COMMENT 'Phụ đề video',
  `channel_id` int(11) DEFAULT NULL COMMENT 'Kênh YouTube',
  `difficulty` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `words_highlighted` int(11) NOT NULL DEFAULT '0',
  `status` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subtitle_status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `channel_id` (`channel_id`),
  KEY `idx_videos_deleted_at` (`deleted_at`),
  CONSTRAINT `videos_ibfk_1` FOREIGN KEY (`channel_id`) REFERENCES `youtube_channels` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `vocabulary`
--

DROP TABLE IF EXISTS `vocabulary`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vocabulary` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID từ vựng',
  `word` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pronunciation` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `part_of_speech` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meaning_en` text COLLATE utf8mb4_unicode_ci COMMENT 'Định nghĩa tiếng Anh',
  `meaning_vi` text COLLATE utf8mb4_unicode_ci COMMENT 'Nghĩa tiếng Việt',
  `example` text COLLATE utf8mb4_unicode_ci COMMENT 'Câu ví dụ',
  `example_vi` text COLLATE utf8mb4_unicode_ci,
  `level` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày tạo',
  PRIMARY KEY (`id`),
  UNIQUE KEY `word` (`word`),
  KEY `idx_vocab_word` (`word`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `youtube_channels`
--

DROP TABLE IF EXISTS `youtube_channels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `youtube_channels` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID kênh',
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Tên kênh',
  `url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Link kênh',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT 'Mô tả kênh',
  `subscriber_count` int(11) DEFAULT NULL COMMENT 'Số lượng subscriber',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày lưu',
  `handle` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `focus_topic` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_channels_deleted_at` (`deleted_at`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-28 17:23:45
