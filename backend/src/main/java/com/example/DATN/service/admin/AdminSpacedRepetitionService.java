package com.example.DATN.service.admin;

import com.example.DATN.dto.admin.*;
import com.example.DATN.entity.SpacedConfig;
import com.example.DATN.repository.learning.ReviewHistoryRepository;
import com.example.DATN.repository.learning.ReviewSessionRepository;
import com.example.DATN.repository.learning.SpacedConfigRepository;
import com.example.DATN.repository.user.UserRepository;
import com.example.DATN.repository.user.UserStatsRepository;
import com.example.DATN.repository.learning.UserVocabularyLearningRepository;
import com.example.DATN.repository.content.VideoRepository;
import com.example.DATN.repository.content.VocabularyRepository;
import com.example.DATN.repository.content.ArticleRepository;
import com.example.DATN.repository.content.LessonRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;

/**
 * Service quản trị hệ thống Spaced Repetition (SRS).
 * Tập trung vào việc báo cáo hiệu suất học tập và phân tích dữ liệu.
 * Các chức năng cấu hình trực tiếp và reset dữ liệu đã được gỡ bỏ để đảm bảo tính ổn định.
 */
@Service
public class AdminSpacedRepetitionService {
    private final ReviewHistoryRepository reviewHistoryRepository;
    private final UserVocabularyLearningRepository userVocabularyLearningRepository;
    private final SpacedConfigRepository spacedConfigRepository;
    private final UserRepository userRepository;
    private final VocabularyRepository vocabularyRepository;
    private final LessonRepository lessonRepository;
    private final ArticleRepository articleRepository;
    private final VideoRepository videoRepository;
    private final ReviewSessionRepository reviewSessionRepository;
    private final UserStatsRepository userStatsRepository;

    public AdminSpacedRepetitionService(
            ReviewHistoryRepository reviewHistoryRepository,
            UserVocabularyLearningRepository userVocabularyLearningRepository,
            SpacedConfigRepository spacedConfigRepository,
            UserRepository userRepository,
            VocabularyRepository vocabularyRepository,
            LessonRepository lessonRepository,
            ArticleRepository articleRepository,
            VideoRepository videoRepository,
            ReviewSessionRepository reviewSessionRepository,
            UserStatsRepository userStatsRepository) {
        this.reviewHistoryRepository = reviewHistoryRepository;
        this.userVocabularyLearningRepository = userVocabularyLearningRepository;
        this.spacedConfigRepository = spacedConfigRepository;
        this.userRepository = userRepository;
        this.vocabularyRepository = vocabularyRepository;
        this.lessonRepository = lessonRepository;
        this.articleRepository = articleRepository;
        this.videoRepository = videoRepository;
        this.reviewSessionRepository = reviewSessionRepository;
        this.userStatsRepository = userStatsRepository;
    }

    /**
     * Lấy báo cáo phân tích hiệu suất học tập toàn hệ thống.
     * Dùng cho trang Learning Management (Analytics).
     */
    public AdminReportsOverviewResponse getLearningOverview() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfToday = today.atStartOfDay();
        LocalDateTime endOfToday = startOfToday.plusDays(1);

        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByIsActiveTrue();
        long newUsersToday = userRepository.countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(startOfToday, endOfToday);

        long totalWords = vocabularyRepository.count();
        long totalLessons = lessonRepository.count();
        long totalReadings = articleRepository.count();
        long totalVideos = videoRepository.count();

        long dailyReviews = reviewHistoryRepository.countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(startOfToday, endOfToday);
        long scheduledReviews = userVocabularyLearningRepository.countByNextReviewLessThanEqual(new java.util.Date());
        long dailyWordsLearned = reviewHistoryRepository.countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(startOfToday, endOfToday);

        double avgAccuracyRaw = reviewSessionRepository.averageAccuracy().orElse(0.0);
        int averageAccuracyRate = normalizeAccuracyPercent(avgAccuracyRaw);
        int lessonCompletionRate = userStatsRepository.averageCompletionRate().orElse(0.0).intValue();
        int activityRate = totalUsers == 0 ? 0 : (int) Math.round((activeUsers * 100.0) / totalUsers);

        List<AdminReportsOverviewResponse.KpiItem> kpiOverview = List.of(
                new AdminReportsOverviewResponse.KpiItem("Tỷ lệ hoàn thành bài học", lessonCompletionRate + "%", "Chỉ số chất lượng mức tiến độ học."),
                new AdminReportsOverviewResponse.KpiItem("Tỷ lệ trả lời đúng trung bình", averageAccuracyRate + "%", "Đánh giá độ chính xác kiến thức toàn hệ thống."),
                new AdminReportsOverviewResponse.KpiItem("Lượng từ được học mỗi ngày", formatNumber(dailyWordsLearned), "Theo dõi cường độ hấp thụ kiến thức."),
                new AdminReportsOverviewResponse.KpiItem("Tỷ lệ hoạt động người dùng", activityRate + "%", "Tỷ lệ active users trên tổng người dùng.")
        );

        List<AdminReportsOverviewResponse.StatCard> stats = List.of(
                new AdminReportsOverviewResponse.StatCard("Tăng trưởng người dùng", "+" + formatNumber(newUsersToday), "Số lượng đăng ký mới trong ngày", "iconoir-user-plus-circle"),
                new AdminReportsOverviewResponse.StatCard("Độ phủ nội dung", formatNumber(totalWords) + " từ", totalLessons + " bài học", "iconoir-journal-page"),
                new AdminReportsOverviewResponse.StatCard("Hiệu suất học tập", averageAccuracyRate + "%", lessonCompletionRate + "% hoàn thành", "iconoir-brain"),
                new AdminReportsOverviewResponse.StatCard("Sức tải SRS", formatNumber(dailyReviews), formatNumber(scheduledReviews) + " từ lên lịch", "iconoir-timer")
        );

        List<AdminReportsOverviewResponse.TrendItem> trendSeries = new java.util.ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate day = today.minusDays(i);
            LocalDateTime dayStart = day.atStartOfDay();
            LocalDateTime endDay = dayStart.plusDays(1);

            java.util.Date dateStart = java.util.Date.from(dayStart.atZone(java.time.ZoneId.systemDefault()).toInstant());
            java.util.Date dateEnd = java.util.Date.from(endDay.atZone(java.time.ZoneId.systemDefault()).toInstant());

            long users = userRepository.countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(dayStart, endDay);
            long mastered = userVocabularyLearningRepository.countMasteredInRange(dateStart, dateEnd);
            long sessions = reviewSessionRepository.countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(dayStart, endDay);
            double dayAvgAccuracy = reviewSessionRepository.averageAccuracyByDateRange(dayStart, endDay).orElse(0.0);
            long accuracyPercent = (long) normalizeAccuracyPercent(dayAvgAccuracy);

            trendSeries.add(new AdminReportsOverviewResponse.TrendItem(weekdayLabel(day.getDayOfWeek()), users, mastered, sessions, accuracyPercent));
        }

        AdminReportsOverviewResponse.StatsSummary summary = new AdminReportsOverviewResponse.StatsSummary(
                dailyReviews, userVocabularyLearningRepository.count(), scheduledReviews, 
                userVocabularyLearningRepository.countByStreakCorrectGreaterThanEqual(5L), 
                lessonCompletionRate, averageAccuracyRate, dailyWordsLearned);

        return new AdminReportsOverviewResponse(stats, kpiOverview, trendSeries, summary);
    }

    /**
     * Lấy thống kê cơ bản cho Admin Dashboard.
     */
    public AdminSpacedOverviewResponse getOverview() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfToday = today.atStartOfDay();
        LocalDateTime endOfToday = startOfToday.plusDays(1);

        long dailyReviews = reviewHistoryRepository.countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(startOfToday, endOfToday);
        long wordsInReview = userVocabularyLearningRepository.count();
        long scheduledReviews = userVocabularyLearningRepository.countByNextReviewLessThanEqual(new java.util.Date());
        long masteredWords = userVocabularyLearningRepository.countByStreakCorrectGreaterThanEqual(5L);

        SpacedConfig config = getOrCreateConfig();

        return new AdminSpacedOverviewResponse(
                new AdminSpacedOverviewResponse.SpacedStats(dailyReviews, wordsInReview, scheduledReviews, masteredWords),
                toConfigDto(config),
                Collections.emptyList() // Danh sách reset để trống vì đã gỡ bỏ tính năng
        );
    }

    private int normalizeAccuracyPercent(double accuracy) {
        double value = accuracy <= 1.0 ? accuracy * 100.0 : accuracy;
        return (int) Math.max(0, Math.min(Math.round(value), 100));
    }

    private String formatNumber(long value) {
        return String.format(Locale.US, "%,d", value);
    }

    private String weekdayLabel(java.time.DayOfWeek dayOfWeek) {
        return switch (dayOfWeek) {
            case MONDAY -> "T2"; case TUESDAY -> "T3"; case WEDNESDAY -> "T4";
            case THURSDAY -> "T5"; case FRIDAY -> "T6"; case SATURDAY -> "T7"; case SUNDAY -> "CN";
        };
    }

    private SpacedConfig getOrCreateConfig() {
        return spacedConfigRepository.findTopByOrderByIdAsc().orElseGet(() -> {
            SpacedConfig config = new SpacedConfig();
            config.beta0 = 2.5; config.beta1 = 1.0; config.beta2 = 0.5;
            config.beta3 = 0.8; config.k = 10; config.maxInterval = 30;
            return spacedConfigRepository.save(config);
        });
    }

    private AdminSpacedConfigDto toConfigDto(SpacedConfig config) {
        Long id = config.id == null ? null : config.id.longValue();
        return new AdminSpacedConfigDto(id, config.beta0, config.beta1, config.beta2, config.beta3, config.k, config.maxInterval);
    }
}
