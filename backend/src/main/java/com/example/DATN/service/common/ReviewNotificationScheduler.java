package com.example.DATN.service.common;

import com.example.DATN.entity.User;
import com.example.DATN.entity.UserStats;
import com.example.DATN.repository.user.UserRepository;
import com.example.DATN.repository.user.UserStatsRepository;
import com.example.DATN.repository.learning.UserVocabularyLearningRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class ReviewNotificationScheduler {

    private final UserRepository userRepository;
    private final UserVocabularyLearningRepository learningRepository;
    private final UserStatsRepository userStatsRepository;
    private final NotificationService notificationService;

    public ReviewNotificationScheduler(
            UserRepository userRepository,
            UserVocabularyLearningRepository learningRepository,
            UserStatsRepository userStatsRepository,
            NotificationService notificationService) {
        this.userRepository = userRepository;
        this.learningRepository = learningRepository;
        this.userStatsRepository = userStatsRepository;
        this.notificationService = notificationService;
    }

    /**
     * Chạy mỗi phút để nhắc nhở ôn tập (Real-time feel)
     */
    @Scheduled(cron = "0 * * * * *")
    public void scheduleReviewNotifications() {
        Date now = new Date();
        // Lấy mốc 12 tiếng trước để tránh spam
        Date twelveHoursAgo = new Date(now.getTime() - (12 * 60 * 60 * 1000));

        // Lấy danh sách tất cả người dùng hoạt động
        List<User> activeUsers = userRepository.findAll().stream()
                .filter(u -> u.deletedAt == null)
                .toList();

        for (User user : activeUsers) {
            // Kiểm tra UserStats
            UserStats stats = userStatsRepository.findByUser_Id(user.id).orElse(null);
            if (stats == null)
                continue;

            // Nếu đã nhắc nhở trong 12 tiếng qua thì bỏ qua
            if (stats.lastReviewNotification != null && stats.lastReviewNotification.after(twelveHoursAgo)) {
                continue;
            }

            // Đếm số từ đến hạn ôn tập
            long dueCount = learningRepository.countDueReviewsByUserId(user.id, now);

            if (dueCount > 0) {
                // Gửi thông báo
                notificationService.sendPrivateNotification(
                        user.id,
                        "REVIEW_REMINDER",
                        "Đã đến lúc ôn tập rồi! Bạn có " + dueCount + " từ vựng cần ôn tập ngay bây giờ. 🔥",
                        dueCount);

                // Cập nhật mốc nhắc nhở cuối
                stats.lastReviewNotification = now;
                userStatsRepository.save(stats);
            }
        }
    }
}
