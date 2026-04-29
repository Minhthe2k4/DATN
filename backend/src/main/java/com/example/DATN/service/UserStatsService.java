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

    @Autowired
    private NotificationService notificationService;

    private final java.util.Map<Long, Long> lastHeartbeats = new java.util.concurrent.ConcurrentHashMap<>();

    /**
     * Đồng bộ hóa hoặc khởi tạo thống kê người dùng.
     */
    @Transactional
    public void syncStats(Long userId) {
        UserStats stats = userStatsRepository.findFirstByUser_Id(userId).orElse(null);

        if (stats == null) {
            try {
                UserStats newStats = new UserStats();
                User user = new User();
                user.id = userId;
                newStats.user = user;
                newStats.learnedWords = 0;
                newStats.totalWords = 0;
                newStats.streakDays = 0;
                newStats.accuracy = 0.0f;
                stats = userStatsRepository.save(newStats);
            } catch (org.springframework.dao.DataIntegrityViolationException e) {
                stats = userStatsRepository.findFirstByUser_Id(userId).orElse(null);
            }
        }

        if (stats == null) return;

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

        // 4. Tính tổng thời gian học (chỉ khởi tạo nếu chưa có dữ liệu heartbeat)
        if (stats.totalStudyTime == null || stats.totalStudyTime == 0.0) {
            Double totalResponseMs = reviewHistoryRepository.findByUser_Id(userId).stream()
                    .mapToDouble(h -> h.responseTime != null ? h.responseTime : 0.0)
                    .sum();
            stats.totalStudyTime = totalResponseMs / (3600.0 * 1000.0);
        }

        userStatsRepository.save(stats);

        // 5. Cập nhật bảng Leaderboard (Điểm số)
        updateLeaderboardScore(userId, stats);
        
        notificationService.broadcastLeaderboardUpdate("Cập nhật mới từ người dùng " + userId);
    }

    private void updateLeaderboardScore(Long userId, UserStats stats) {
        com.example.DATN.entity.Leaderboard lb = leaderboardRepository.findFirstByUser_Id(userId)
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
        
        notificationService.broadcastLeaderboardUpdate("Bảng xếp hạng đã được làm mới");
    }

    /**
     * Cập nhật streak khi người dùng hoàn thành một phiên học.
     */
    @Transactional
    public void updateStreak(Long userId) {
        UserStats stats = userStatsRepository.findFirstByUser_Id(userId).orElse(null);
        if (stats == null) {
            syncStats(userId);
            stats = userStatsRepository.findFirstByUser_Id(userId).orElse(null);
        }
        if (stats == null)
            return;

        java.time.LocalDate today = java.time.LocalDate.now();
        java.time.LocalDate lastStudy = null;
        if (stats.lastStudyDate != null) {
            if (stats.lastStudyDate instanceof java.sql.Date) {
                lastStudy = ((java.sql.Date) stats.lastStudyDate).toLocalDate();
            } else {
                lastStudy = stats.lastStudyDate.toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDate();
            }
        }

        if (lastStudy == null) {
            stats.streakDays = 1;
        } else if (lastStudy.isEqual(today.minusDays(1))) {
            stats.streakDays = (stats.streakDays != null ? stats.streakDays : 0) + 1;
        } else if (lastStudy.isBefore(today.minusDays(1))) {
            stats.streakDays = 1;
        }
        
        stats.lastStudyDate = java.util.Date.from(today.atStartOfDay(java.time.ZoneId.systemDefault()).toInstant());

        userStatsRepository.save(stats);
        
        notificationService.broadcastLeaderboardUpdate("Cập nhật mới từ người dùng " + userId);
    }

    @Transactional
    public void recordHeartbeat(Long userId) {
        UserStats stats = userStatsRepository.findFirstByUser_Id(userId).orElse(null);
        if (stats == null) {
            syncStats(userId);
            stats = userStatsRepository.findFirstByUser_Id(userId).orElse(null);
        }

        if (stats == null)
            return;

        long now = System.currentTimeMillis();
        Long last = lastHeartbeats.get(userId);

        if (last != null) {
            long diffMs = now - last;
            // Nếu khoảng cách giữa 2 heartbeat nhỏ hơn 5 phút (tránh treo máy hoặc đa luồng
            // quá mức)
            if (diffMs > 0 && diffMs < 5 * 60 * 1000) {
                double diffHours = diffMs / (3600.0 * 1000.0);
                stats.totalStudyTime = (stats.totalStudyTime != null ? stats.totalStudyTime : 0.0) + diffHours;
            }
        }

        lastHeartbeats.put(userId, now);
        userStatsRepository.save(stats);

        // Phát tín hiệu cập nhật Leaderboard cho tất cả mọi người
        notificationService.broadcastLeaderboardUpdate("Cập nhật mới từ người dùng " + userId);
    }
}
