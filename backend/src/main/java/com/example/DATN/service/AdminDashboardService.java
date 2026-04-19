package com.example.DATN.service;

import com.example.DATN.dto.AdminDashboardOverviewResponse;
import com.example.DATN.entity.Article;
import com.example.DATN.entity.Lesson;
import com.example.DATN.entity.Topic;
import com.example.DATN.repository.ArticleRepository;
import com.example.DATN.repository.LessonRepository;
import com.example.DATN.repository.ReviewHistoryRepository;
import com.example.DATN.repository.ReviewSessionRepository;
import com.example.DATN.repository.TopicRepository;
import com.example.DATN.repository.TransactionRepository;
import com.example.DATN.repository.UserRepository;
import com.example.DATN.repository.UserStatsRepository;
import com.example.DATN.repository.UserSubscriptionRepository;
import com.example.DATN.repository.PendingPremiumRequestProjection;
import com.example.DATN.repository.TopUserActivityProjection;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
public class AdminDashboardService {
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final Set<String> PENDING_PREMIUM_STATUSES = Set.of(
            "PENDING", "PROCESSING", "CREATED", "WAITING", "REQUIRES_REVIEW"
    );

    private final UserRepository userRepository;
    private final TopicRepository topicRepository;
    private final LessonRepository lessonRepository;
    private final ArticleRepository articleRepository;
    private final ReviewSessionRepository reviewSessionRepository;
    private final ReviewHistoryRepository reviewHistoryRepository;
    private final UserSubscriptionRepository userSubscriptionRepository;
    private final TransactionRepository transactionRepository;
    private final UserStatsRepository userStatsRepository;

    public AdminDashboardService(
            UserRepository userRepository,
            TopicRepository topicRepository,
            LessonRepository lessonRepository,
            ArticleRepository articleRepository,
            ReviewSessionRepository reviewSessionRepository,
            ReviewHistoryRepository reviewHistoryRepository,
            UserSubscriptionRepository userSubscriptionRepository,
            TransactionRepository transactionRepository,
            UserStatsRepository userStatsRepository
    ) {
        this.userRepository = userRepository;
        this.topicRepository = topicRepository;
        this.lessonRepository = lessonRepository;
        this.articleRepository = articleRepository;
        this.reviewSessionRepository = reviewSessionRepository;
        this.reviewHistoryRepository = reviewHistoryRepository;
        this.userSubscriptionRepository = userSubscriptionRepository;
        this.transactionRepository = transactionRepository;
        this.userStatsRepository = userStatsRepository;
    }

    public AdminDashboardOverviewResponse getOverview() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        long activeUsers = userRepository.countByIsActiveTrue();
        long blockedUsers = userRepository.countByIsActiveFalse();
        long newUsersToday = userRepository.countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(startOfDay, endOfDay);

        long pausedTopics = topicRepository.countByStatusFalse();
        long draftLessons = lessonRepository.countDraftLessons();
        long draftReadings = articleRepository.countDraftArticles();

        long dailyStudySessions = reviewSessionRepository.countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(startOfDay, endOfDay);
        long dailyLogins = reviewSessionRepository.countDistinctUsersInRange(startOfDay, endOfDay);
        long dailyReviews = reviewHistoryRepository.countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(startOfDay, endOfDay);

        long premiumUsers = userSubscriptionRepository.countActivePremiumUsers(LocalDateTime.now());
        long pendingPremiumRequests = transactionRepository.countByStatuses(PENDING_PREMIUM_STATUSES);

        List<AdminDashboardOverviewResponse.StatCard> stats = List.of(
                new AdminDashboardOverviewResponse.StatCard(
                        "Người dùng đang hoạt động",
                        formatNumber(activeUsers),
                        formatNumber(dailyLogins) + " lượt đăng nhập hôm nay",
                        "iconoir-user-circle"
                ),
                new AdminDashboardOverviewResponse.StatCard(
                        "Yêu cầu Premium chờ xử lý",
                        formatNumber(pendingPremiumRequests),
                        formatNumber(premiumUsers) + " tài khoản Premium đang hoạt động",
                        "iconoir-star"
                ),
                new AdminDashboardOverviewResponse.StatCard(
                        "Nội dung cần rà soát",
                        formatNumber(pausedTopics + draftLessons + draftReadings),
                        pausedTopics + " chủ đề tạm dừng, " + (draftLessons + draftReadings) + " mục nháp/chờ biên tập",
                        "iconoir-edit-pencil"
                ),
                new AdminDashboardOverviewResponse.StatCard(
                        "Tài khoản cần can thiệp",
                        formatNumber(blockedUsers),
                        "Bao gồm trạng thái bị khóa hoặc chờ xác minh",
                        "iconoir-warning-triangle"
                )
        );

        List<AdminDashboardOverviewResponse.MetricItem> dailyOperations = List.of(
                new AdminDashboardOverviewResponse.MetricItem(
                        "Buổi học phát sinh hôm nay",
                        formatNumber(dailyStudySessions),
                        "Theo dõi tải vận hành học tập theo ngày."
                ),
                new AdminDashboardOverviewResponse.MetricItem(
                        "Lượt xem lại trong ngày",
                        formatNumber(dailyReviews),
                        "Dùng để kiểm tra áp lực hàng đợi SRS."
                ),
                new AdminDashboardOverviewResponse.MetricItem(
                        "Người dùng mới trong ngày",
                        formatNumber(newUsersToday),
                        "Chỉ số tăng trưởng ngắn hạn phục vụ trực vận hành."
                )
        );

        List<AdminDashboardOverviewResponse.ModerationItem> moderationRows = new ArrayList<>();
        topicRepository.findTop6ByStatusFalseOrderByIdDesc().forEach(topic -> moderationRows.add(
                new AdminDashboardOverviewResponse.ModerationItem(
                        "TOP-" + topic.id,
                        "Chủ đề",
                        topic.name,
                        "Tạm dừng"
                )
        ));
        lessonRepository.findDraftLessons(PageRequest.of(0, 6)).forEach(lesson -> moderationRows.add(
                new AdminDashboardOverviewResponse.ModerationItem(
                        "LES-" + lesson.id,
                        "Bài học",
                        lesson.name,
                        "Nháp"
                )
        ));
        articleRepository.findDraftArticles(PageRequest.of(0, 6)).forEach(article -> moderationRows.add(
                new AdminDashboardOverviewResponse.ModerationItem(
                        "ART-" + article.id,
                        "Bài đọc",
                        article.title,
                        "Chờ biên tập"
                )
        ));

        List<AdminDashboardOverviewResponse.PremiumRequestItem> premiumRequests = transactionRepository
                .findPendingRequests(PENDING_PREMIUM_STATUSES, PageRequest.of(0, 8))
                .stream()
                .map(row -> new AdminDashboardOverviewResponse.PremiumRequestItem(
                        "PREQ-" + row.getId(),
                        defaultString(row.getEmail(), "(không có email)"),
                        row.getRequestedAt() == null ? "-" : row.getRequestedAt().format(DATE_TIME_FORMATTER),
                        defaultString(row.getPackageName(), "Premium"),
                        mapPremiumRequestStatus(row.getStatus())
                ))
                .toList();

        List<AdminDashboardOverviewResponse.UserActivityLeaderItem> leaders = userStatsRepository
                .findTopUsers(PageRequest.of(0, 6))
                .stream()
                .map(row -> {
                    int learnedWords = safeInt(Math.toIntExact(row.getLearnedWords()));
                    int completion = calculateCompletion(learnedWords, safeInt(Math.toIntExact(row.getTotalWords())));
                    return new AdminDashboardOverviewResponse.UserActivityLeaderItem(
                            "USR-" + defaultString(row.getUsername(), "unknown"),
                            defaultString(row.getUsername(), "Người dùng"),
                            safeInt(Math.toIntExact(row.getStreakDays())),
                            learnedWords,
                            completion
                    );
                })
                .toList();

        List<String> checklist = List.of(
                "Kiểm duyệt từ mới trước khi xuất bản vào bài học.",
                "Đảm bảo mọi chủ đề có trạng thái hoạt động rõ ràng.",
                "Theo dõi người dùng bị khóa và lịch sử can thiệp quản trị.",
                "Duy trì cấu hình spaced repetition ổn định trước khi reset dữ liệu."
        );

        return new AdminDashboardOverviewResponse(
                stats,
                dailyOperations,
                moderationRows,
                premiumRequests,
                leaders,
                checklist
        );
    }

    private String formatNumber(long value) {
        return String.format(Locale.US, "%,d", value);
    }

    private String mapPremiumRequestStatus(String status) {
        String normalized = status == null ? "" : status.trim().toUpperCase(Locale.ROOT);
        if (Set.of("PENDING", "CREATED", "WAITING").contains(normalized)) {
            return "Chờ duyệt";
        }
        if (Set.of("PROCESSING", "REQUIRES_REVIEW").contains(normalized)) {
            return "Cần đối soát";
        }
        return "Chờ duyệt";
    }

    private int calculateCompletion(int learnedWords, int totalWords) {
        if (totalWords <= 0) {
            return 0;
        }
        double percent = (learnedWords * 100.0) / totalWords;
        return Math.max(0, Math.min((int) Math.round(percent), 100));
    }

    private int safeInt(Integer value) {
        return value == null ? 0 : value;
    }

    private String defaultString(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value;
    }
}
