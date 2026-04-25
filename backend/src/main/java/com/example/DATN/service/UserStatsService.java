package com.example.DATN.service;

import com.example.DATN.entity.User;
import com.example.DATN.entity.UserStats;
import com.example.DATN.repository.ReviewSessionRepository;
import com.example.DATN.repository.UserStatsRepository;
import com.example.DATN.repository.UserVocabularyLearningRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

@Service
public class UserStatsService {

    @Autowired
    private UserStatsRepository userStatsRepository;

    @Autowired
    private UserVocabularyLearningRepository userVocabularyLearningRepository;

    @Autowired
    private ReviewSessionRepository reviewSessionRepository;

    @Autowired
    private com.example.DATN.repository.LeaderboardRepository leaderboardRepository;

    @Autowired
    private com.example.DATN.repository.ReviewHistoryRepository reviewHistoryRepository;

    /**
     * Đồng bộ hóa hoặc khởi tạo thống kê người dùng.
     */
    @Transactional
    public void syncStats(Long userId) {
        UserStats stats = userStatsRepository.findByUser_Id(userId)
                .orElseGet(() -> {
                    UserStats newStats = new UserStats();
                    User user = new User();
                    user.id = userId;
                    newStats.user = user;
                    newStats.learnedWords = 0;
                    newStats.totalWords = 0;
                    newStats.streakDays = 0;
                    newStats.accuracy = 0.0f;
                    return newStats;
                });

        // 1. Tính tổng số từ đang học
        long totalWords = userVocabularyLearningRepository.countByUser_Id(userId);
        stats.totalWords = (int) totalWords;

        // 2. Tính số từ đã thuộc (giả định streakCorrect >= 5 là thuộc)
        long learnedWords = userVocabularyLearningRepository.findByUser_Id(userId).stream()
                .filter(row -> (row.streakCorrect != null && row.streakCorrect >= 5))
                .count();
        stats.learnedWords = (int) learnedWords;

        // 3. Tính độ chính xác trung bình từ các phiên học
        Double avgAccuracy = reviewSessionRepository.findByUser_Id(userId).stream()
                .mapToDouble(s -> s.accuracy != null ? s.accuracy : 0.0)
                .average()
                .orElse(0.0);
        stats.accuracy = avgAccuracy.floatValue();

        // 4. Tính tổng thời gian học (giờ)
        Double totalResponseMs = reviewHistoryRepository.findByUser_Id(userId).stream()
                .mapToDouble(h -> h.responseTime != null ? h.responseTime : 0.0)
                .sum();
        stats.totalStudyTime = totalResponseMs / (3600.0 * 1000.0);

        userStatsRepository.save(stats);

        // 5. Cập nhật bảng Leaderboard (Điểm số)
        updateLeaderboardScore(userId, stats);
    }

    private void updateLeaderboardScore(Long userId, UserStats stats) {
        com.example.DATN.entity.Leaderboard lb = leaderboardRepository.findByUser_Id(userId)
                .orElseGet(() -> {
                    com.example.DATN.entity.Leaderboard newLb = new com.example.DATN.entity.Leaderboard();
                    User user = new User();
                    user.id = userId;
                    newLb.user = user;
                    return newLb;
                });

        // Công thức tính điểm: (Số từ đã thuộc * 100) + (Chuỗi ngày học * 50)
        int learnedWords = stats.learnedWords != null ? stats.learnedWords : 0;
        int streakDays = stats.streakDays != null ? stats.streakDays : 0;
        lb.score = (learnedWords * 100) + (streakDays * 50);

        leaderboardRepository.save(lb);
    }

    /**
     * Cập nhật thứ hạng cho toàn bộ người dùng.
     * Thường chạy định kỳ hoặc khi admin yêu cầu.
     */
    @Transactional
    public void recalculateRanks() {
        java.util.List<com.example.DATN.entity.Leaderboard> all = leaderboardRepository.findAll(
                org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "score"));

        for (int i = 0; i < all.size(); i++) {
            all.get(i).rank = i + 1;
        }
        leaderboardRepository.saveAll(all);
    }

    /**
     * Cập nhật streak khi người dùng hoàn thành một phiên học.
     */
    @Transactional
    public void updateStreak(Long userId) {
        UserStats stats = userStatsRepository.findByUser_Id(userId).orElse(null);
        if (stats == null) {
            syncStats(userId);
            stats = userStatsRepository.findByUser_Id(userId).orElse(null);
        }
        if (stats == null)
            return;

        if (stats.streakDays == null || stats.streakDays == 0) {
            stats.streakDays = 1;
        }

        userStatsRepository.save(stats);
    }
}
