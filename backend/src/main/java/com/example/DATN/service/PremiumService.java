package com.example.DATN.service;

import com.example.DATN.entity.User;
import com.example.DATN.entity.UserSubscription;
//import com.example.DATN.repository.UserRepository;
//import com.example.DATN.repository.UserSubscriptionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.SimpleDateFormat;
import java.util.Date;

@Service
public class PremiumService {

    public static final String FEATURE_FLASHCARD_DECKS = "FLASHCARD_DECKS";
    public static final String FEATURE_FLASHCARDS_PER_DECK = "FLASHCARDS_PER_DECK";
    public static final String FEATURE_SRS_GOLDEN_TIME = "SRS_GOLDEN_TIME";

    private final com.example.DATN.repository.UserSubscriptionRepository subscriptionRepository;
    private final com.example.DATN.repository.UserRepository userRepository;
    private final com.example.DATN.repository.PremiumPlanRepository planRepository;
    private final com.example.DATN.repository.PremiumFeatureLimitRepository featureLimitRepository;

    public PremiumService(com.example.DATN.repository.UserSubscriptionRepository subscriptionRepository,
            com.example.DATN.repository.UserRepository userRepository,
            com.example.DATN.repository.PremiumPlanRepository planRepository,
            com.example.DATN.repository.PremiumFeatureLimitRepository featureLimitRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.userRepository = userRepository;
        this.planRepository = planRepository;
        this.featureLimitRepository = featureLimitRepository;
    }

    /**
     * Kiểm tra xem người dùng có quyền tra cứu từ điển hay không.
     * Nếu là gói Free, giới hạn 5 lần/ngày.
     */
    @Transactional
    public void checkAndIncrementLookupLimit(Long userId) {
        if (userId == null)
            return;

        UserSubscription sub = subscriptionRepository.findLatestByUserId(userId).stream().findFirst()
                .orElseGet(() -> {
                    User user = userRepository.findById(userId).orElseThrow();
                    UserSubscription newSub = new UserSubscription(user);
                    newSub.startDate = new Date();
                    newSub.status = "FREE";
                    
                    // Priority 1: Plan named "Free" (any case)
                    // Priority 2: Any plan available
                    newSub.plan = planRepository.findAll().stream()
                            .filter(p -> p.name.equalsIgnoreCase("Free"))
                            .findFirst()
                            .orElseGet(() -> planRepository.findAll().stream().findFirst().orElse(null));

                    return subscriptionRepository.save(newSub);
                });

        // Fetch dynamic limit from database
        int dailyLimit;
        if (sub.plan == null) {
            System.out.println("[DEBUG] User has NO plan assigned. Falling back to default.");
            dailyLimit = (sub.isPremium != null && sub.isPremium) ? 999999 : 5;
        } else {
            System.out.println("[DEBUG] User on plan: " + sub.plan.name + " (ID: " + sub.plan.id + ")");
            dailyLimit = featureLimitRepository.findByPlanIdAndFeatureName(sub.plan.id, "DICTIONARY_LOOKUP")
                    .map(com.example.DATN.entity.PremiumFeatureLimit::getUsageLimit)
                    .orElseGet(() -> {
                        System.out.println("[DEBUG] No specific limit found in DB for this plan. Using fallback.");
                        return (sub.isPremium != null && sub.isPremium) ? 999999 : 5;
                    });
        }
        System.out.println("[DEBUG] Resolved dailyLimit: " + dailyLimit + " (Count so far: " + sub.dailyLookupCount + ")");

        // 1. Check if feature is locked
        boolean isLocked = false;
        if (sub.plan != null) {
            isLocked = featureLimitRepository.findByPlanIdAndFeatureName(sub.plan.id, "DICTIONARY_LOOKUP")
                .map(com.example.DATN.entity.PremiumFeatureLimit::getIsLocked).orElse(false);
        } else {
            isLocked = planRepository.findAll().stream()
                .filter(p -> p.name.equalsIgnoreCase("Free")).findFirst()
                .flatMap(p -> featureLimitRepository.findByPlanIdAndFeatureName(p.id, "DICTIONARY_LOOKUP"))
                .map(com.example.DATN.entity.PremiumFeatureLimit::getIsLocked).orElse(false);
        }
        
        if (isLocked) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN,
                    "Tính năng tra cứu từ điển hiện đang bị khóa cho gói cước của bạn."
            );
        }

        // Reset counter if it's a new day
        Date today = new Date();
        if (sub.lastLookupDate == null || !isSameDay(sub.lastLookupDate, today)) {
            sub.dailyLookupCount = 0;
            sub.lastLookupDate = today;
        }

        if (sub.dailyLookupCount >= dailyLimit) {
            String msg = Boolean.TRUE.equals(sub.isPremium) 
                ? "Bạn đã dùng hết lượt tra cứu giới hạn của gói Premium này."
                : "Bạn đã hết lượt tra cứu miễn phí hôm nay (Tối đa " + dailyLimit + " lần). Hãy nâng cấp Premium để học tập không giới hạn!";
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN,
                    msg
            );
        }

        sub.dailyLookupCount++;
        subscriptionRepository.save(sub);
    }

    /**
     * Kiểm tra và tăng lượt tải bài báo.
     */
    public void checkAndIncrementDownloadLimit(Long userId) {
        checkAndIncrementActionLimit(userId, "ARTICLE_DOWNLOADS", "tải bài báo", "ngày");
    }

    /**
     * Kiểm tra và tăng lượt tải phụ đề video.
     */
    public void checkAndIncrementVideoDownloadLimit(Long userId) {
        checkAndIncrementActionLimit(userId, "VIDEO_TRANSCRIPT_DOWNLOADS", "tải phụ đề video", "ngày");
    }

    /**
     * Kiểm tra và tăng lượt làm bài kiểm tra.
     */
    public void checkAndIncrementTestLimit(Long userId) {
        checkAndIncrementActionLimit(userId, "MONTHLY_VOCABULARY_TESTS", "làm bài kiểm tra", "tháng");
    }

    /**
     * Chỉ kiểm tra quyền truy cập (không tăng bộ đếm).
     * Dùng cho các tính năng không giới hạn lượt dùng nhưng có thể bị khóa (ví dụ: Ôn tập SRS).
     */
    public void checkFeatureAccess(Long userId, String featureId, String featureLabel) {
        UserSubscription sub = subscriptionRepository.findLatestByUserId(userId).stream().findFirst()
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Không tìm thấy thông tin đăng ký."));

        Long planId = sub.plan != null ? sub.plan.id : null;
        java.util.Optional<com.example.DATN.entity.PremiumFeatureLimit> limitOpt = java.util.Optional.empty();
        if (planId != null) {
            limitOpt = featureLimitRepository.findByPlanId(planId).stream()
                    .filter(l -> featureId.equals(l.getFeatureName()))
                    .findFirst();
        }

        // 1. Check Locked
        if (limitOpt.map(com.example.DATN.entity.PremiumFeatureLimit::getIsLocked).orElse(false)) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN,
                    "Tính năng " + featureLabel + " hiện đang bị khóa cho gói cước của bạn. Vui lòng nâng cấp gói cước để sử dụng."
            );
        }

        // 2. Check if user is premium for locked-by-default features
        if (limitOpt.isEmpty() && !Boolean.TRUE.equals(sub.isPremium)) {
             // Optional: handle default logic for free users
        }
    }

    /**
     * Lấy giá trị giới hạn số lượng của một tính năng.
     */
    public int getFeatureLimit(Long userId, String featureId, int defaultLimit) {
        UserSubscription sub = subscriptionRepository.findLatestByUserId(userId).stream().findFirst().orElse(null);
        if (sub == null) return defaultLimit;

        Long planId = sub.plan != null ? sub.plan.id : null;
        if (planId == null) return defaultLimit;

        return featureLimitRepository.findByPlanId(planId).stream()
                .filter(l -> featureId.equals(l.getFeatureName()))
                .findFirst()
                .map(l -> l.getUsageLimit() != null ? l.getUsageLimit() : defaultLimit)
                .orElse(defaultLimit);
    }

    /**
     * Hàm chung để kiểm tra và tăng lượt sử dụng một tính năng theo ngày/tháng.
     */
    public void checkAndIncrementActionLimit(Long userId, String featureId, String featureLabel) {
        checkAndIncrementActionLimit(userId, featureId, featureLabel, "DAILY");
    }

    public void checkAndIncrementActionLimit(Long userId, String featureId, String featureLabel, String periodType) {
        UserSubscription sub = subscriptionRepository.findLatestByUserId(userId).stream().findFirst()
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Không tìm thấy thông tin đăng ký."));

        // Fetch dynamic limit
        Long planId = sub.plan != null ? sub.plan.id : null;
        java.util.Optional<com.example.DATN.entity.PremiumFeatureLimit> limitOpt = java.util.Optional.empty();
        if (planId != null) {
            limitOpt = featureLimitRepository.findByPlanId(planId).stream()
                    .filter(l -> featureId.equals(l.getFeatureName()))
                    .findFirst();
        }

        // 1. Check Locked status
        boolean isLocked;
        if (sub.plan == null) {
            isLocked = planRepository.findAll().stream()
                .filter(p -> p.name.equalsIgnoreCase("Free")).findFirst()
                .flatMap(p -> featureLimitRepository.findByPlanIdAndFeatureName(p.id, featureId))
                .map(com.example.DATN.entity.PremiumFeatureLimit::getIsLocked).orElse(false);
        } else {
            isLocked = featureLimitRepository.findByPlanIdAndFeatureName(sub.plan.id, featureId)
                .map(com.example.DATN.entity.PremiumFeatureLimit::getIsLocked).orElse(false);
        }
        
        if (isLocked) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN,
                    "Tính năng " + featureLabel + " hiện đang bị khóa cho gói cước của bạn."
            );
        }

        // 2. Check usage limit
        int limit;
        if (sub.plan == null) {
            limit = planRepository.findAll().stream()
                    .filter(p -> p.name.equalsIgnoreCase("Free")).findFirst()
                    .flatMap(p -> featureLimitRepository.findByPlanIdAndFeatureName(p.id, featureId))
                    .map(com.example.DATN.entity.PremiumFeatureLimit::getUsageLimit)
                    .orElse(5);
        } else {
            limit = featureLimitRepository.findByPlanIdAndFeatureName(sub.plan.id, featureId)
                    .map(com.example.DATN.entity.PremiumFeatureLimit::getUsageLimit)
                    .orElseGet(() -> (sub.isPremium != null && sub.isPremium) ? 999999 : 5);
        }
        System.out.println("[DEBUG] Action " + featureId + " resolved limit: " + limit);

        if (limit <= 0 && !Boolean.TRUE.equals(sub.isPremium)) {
             throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN,
                    "Tính năng " + featureLabel + " yêu cầu gói Premium."
            );
        }

        Date today = new Date();
        
        // Handle counters based on featureId
        if (featureId.equals("ARTICLE_DOWNLOADS")) {
            if (sub.lastDownloadDate == null || !isSameDay(sub.lastDownloadDate, today)) {
                sub.dailyDownloadCount = 0; sub.lastDownloadDate = today;
            }
            if (sub.dailyDownloadCount >= limit && limit < 999999) {
                throwLimitException(featureLabel, limit, periodType);
            }
            sub.dailyDownloadCount = (sub.dailyDownloadCount == null ? 0 : sub.dailyDownloadCount) + 1;
        } 
        else if (featureId.equals("VIDEO_TRANSCRIPT_DOWNLOADS")) {
            if (sub.lastVideoDownloadDate == null || !isSameDay(sub.lastVideoDownloadDate, today)) {
                sub.dailyVideoDownloadCount = 0; sub.lastVideoDownloadDate = today;
            }
            if (sub.dailyVideoDownloadCount >= limit && limit < 999999) {
                throwLimitException(featureLabel, limit, periodType);
            }
            sub.dailyVideoDownloadCount = (sub.dailyVideoDownloadCount == null ? 0 : sub.dailyVideoDownloadCount) + 1;
        }
        else if (featureId.equals("MONTHLY_VOCABULARY_TESTS")) {
            if (sub.lastTestDate == null || !isSameMonth(sub.lastTestDate, today)) {
                sub.monthlyTestCount = 0; sub.lastTestDate = today;
            }
            if (sub.monthlyTestCount >= limit && limit < 999999) {
                throwLimitException(featureLabel, limit, periodType);
            }
            sub.monthlyTestCount = (sub.monthlyTestCount == null ? 0 : sub.monthlyTestCount) + 1;
        }

        subscriptionRepository.save(sub);
    }

    private void throwLimitException(String featureLabel, int limit, String periodType) {
        throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.FORBIDDEN,
                "Bạn đã hết lượt " + featureLabel + " trong " + periodType + " này (Tối đa " + limit + " lượt)."
        );
    }

    private boolean isSameMonth(Date d1, Date d2) {
        java.text.SimpleDateFormat fmt = new java.text.SimpleDateFormat("yyyyMM");
        return fmt.format(d1).equals(fmt.format(d2));
    }

    /**
     * Kiểm tra xem người dùng có phải là thành viên Premium hay không.
     */
    public boolean isPremium(Long userId) {
        if (userId == null)
            return false;
        return subscriptionRepository.findLatestByUserId(userId).stream().findFirst()
                .map(sub -> Boolean.TRUE.equals(sub.isPremium))
                .orElse(false);
    }

    @Transactional
    public void upgradeUserAfterPayment(Long userId, Long planId) {
        UserSubscription sub = subscriptionRepository.findLatestByUserId(userId).stream().findFirst()
                .orElseGet(() -> {
                    User user = userRepository.findById(userId).orElseThrow();
                    UserSubscription newSub = new UserSubscription(user);
                    return newSub;
                });

        com.example.DATN.entity.PremiumPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found"));

        sub.isPremium = true;
        sub.status = "ACTIVE";
        sub.plan = plan;
        sub.startDate = new Date();
        
        java.util.Calendar c = java.util.Calendar.getInstance();
        c.setTime(sub.startDate);
        c.add(java.util.Calendar.DAY_OF_MONTH, plan.duration != null ? plan.duration : 30);
        sub.endDate = c.getTime();

        subscriptionRepository.save(sub);
    }

    private boolean isSameDay(Date d1, Date d2) {
        SimpleDateFormat fmt = new SimpleDateFormat("yyyyMMdd");
        return fmt.format(d1).equals(fmt.format(d2));
    }
}
