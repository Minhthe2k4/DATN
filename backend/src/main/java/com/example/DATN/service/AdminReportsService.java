package com.example.DATN.service;

import com.example.DATN.dto.AdminReportsOverviewResponse;
import com.example.DATN.repository.ArticleRepository;
import com.example.DATN.repository.LessonRepository;
import com.example.DATN.repository.ReviewHistoryRepository;
import com.example.DATN.repository.ReviewSessionRepository;
import com.example.DATN.repository.UserRepository;
import com.example.DATN.repository.UserStatsRepository;
import com.example.DATN.repository.UserVocabularyLearningRepository;
import com.example.DATN.repository.VideoRepository;
import com.example.DATN.repository.VocabularyRepository;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;

@Service
public class AdminReportsService {
    private final UserRepository userRepository;
    private final VocabularyRepository vocabularyRepository;
    private final LessonRepository lessonRepository;
    private final ArticleRepository articleRepository;
    private final VideoRepository videoRepository;
    private final ReviewSessionRepository reviewSessionRepository;
    private final ReviewHistoryRepository reviewHistoryRepository;
    private final UserVocabularyLearningRepository userVocabularyLearningRepository;
    private final UserStatsRepository userStatsRepository;

    public AdminReportsService(
            UserRepository userRepository,
            VocabularyRepository vocabularyRepository,
            LessonRepository lessonRepository,
            ArticleRepository articleRepository,
            VideoRepository videoRepository,
            ReviewSessionRepository reviewSessionRepository,
            ReviewHistoryRepository reviewHistoryRepository,
            UserVocabularyLearningRepository userVocabularyLearningRepository,
            UserStatsRepository userStatsRepository
    ) {
        this.userRepository = userRepository;
        this.vocabularyRepository = vocabularyRepository;
        this.lessonRepository = lessonRepository;
        this.articleRepository = articleRepository;
        this.videoRepository = videoRepository;
        this.reviewSessionRepository = reviewSessionRepository;
        this.reviewHistoryRepository = reviewHistoryRepository;
        this.userVocabularyLearningRepository = userVocabularyLearningRepository;
        this.userStatsRepository = userStatsRepository;
    }

    public AdminReportsOverviewResponse getOverview() {
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
                new AdminReportsOverviewResponse.KpiItem(
                        "Tỷ lệ hoàn thành bài học",
                        lessonCompletionRate + "%",
                        "Chỉ số chất lượng mức tiến độ học."
                ),
                new AdminReportsOverviewResponse.KpiItem(
                        "Tỷ lệ trả lời đúng trung bình",
                        averageAccuracyRate + "%",
                        "Đánh giá độ chính xác kiến thức toàn hệ thống."
                ),
                new AdminReportsOverviewResponse.KpiItem(
                        "Lượng từ được học mỗi ngày",
                        formatNumber(dailyWordsLearned),
                        "Theo dõi cường độ hấp thụ kiến thức."
                ),
                new AdminReportsOverviewResponse.KpiItem(
                        "Tỷ lệ hoạt động người dùng",
                        activityRate + "%",
                        "Tỷ lệ active users trên tổng người dùng."
                )
        );

        List<AdminReportsOverviewResponse.StatCard> stats = List.of(
                new AdminReportsOverviewResponse.StatCard(
                        "Tăng trưởng người dùng ngày",
                        "+" + formatNumber(newUsersToday),
                        "Số lượng đăng ký mới ghi nhận trong ngày",
                        "iconoir-user-plus-circle"
                ),
                new AdminReportsOverviewResponse.StatCard(
                        "Độ phủ nội dung học",
                        formatNumber(totalWords) + " từ",
                        totalLessons + " bài học, " + (totalReadings + totalVideos) + " tư liệu",
                        "iconoir-journal-page"
                ),
                new AdminReportsOverviewResponse.StatCard(
                        "Hiệu suất học tập",
                        averageAccuracyRate + "%",
                        lessonCompletionRate + "% hoàn thành bài học",
                        "iconoir-brain"
                ),
                new AdminReportsOverviewResponse.StatCard(
                        "Sức tải ôn tập SRS",
                        formatNumber(dailyReviews),
                        formatNumber(scheduledReviews) + " từ đã được lên lịch",
                        "iconoir-timer"
                )
        );

        List<AdminReportsOverviewResponse.TrendItem> trendSeries = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate day = today.minusDays(i);
            LocalDateTime dayStart = day.atStartOfDay();
            LocalDateTime dayEnd = dayStart.plusDays(1);

            long users = userRepository.countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(dayStart, dayEnd);
            long words = vocabularyRepository.countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(dayStart, dayEnd);
            long lessons = reviewSessionRepository.countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(dayStart, dayEnd);
            // Count words scheduled for review (thời điểm vàng) on this day instead of completed reviews
            long reviews = userVocabularyLearningRepository.countByNextReviewGreaterThanEqualAndNextReviewLessThan(new java.util.Date(dayStart.atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli()), new java.util.Date(dayEnd.atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli()));

            trendSeries.add(new AdminReportsOverviewResponse.TrendItem(
                    weekdayLabel(day.getDayOfWeek()),
                    users,
                    words,
                    lessons,
                    reviews
            ));
        }

        return new AdminReportsOverviewResponse(stats, kpiOverview, trendSeries);
    }

    private int normalizeAccuracyPercent(double accuracy) {
        double value = accuracy;
        if (accuracy <= 1.0) {
            value = accuracy * 100.0;
        }
        int rounded = (int) Math.round(value);
        return Math.max(0, Math.min(rounded, 100));
    }

    private String formatNumber(long value) {
        return String.format(Locale.US, "%,d", value);
    }

    private String weekdayLabel(DayOfWeek dayOfWeek) {
        return switch (dayOfWeek) {
            case MONDAY -> "T2";
            case TUESDAY -> "T3";
            case WEDNESDAY -> "T4";
            case THURSDAY -> "T5";
            case FRIDAY -> "T6";
            case SATURDAY -> "T7";
            case SUNDAY -> "CN";
        };
    }
}
