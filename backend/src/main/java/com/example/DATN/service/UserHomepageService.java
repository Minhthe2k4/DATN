package com.example.DATN.service;

import com.example.DATN.entity.*;
import com.example.DATN.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class UserHomepageService {
    @Autowired
    private UserSubscriptionRepository userSubscriptionRepository;

    @Autowired
    private UserStatsRepository userStatsRepository;

    @Autowired
    private UserVocabularyLearningRepository userVocabularyLearningRepository;

    @Autowired
    private VocabularyRepository vocabularyRepository;

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private PremiumFeatureLimitRepository premiumFeatureLimitRepository;

    @Autowired
    private PremiumPlanRepository premiumPlanRepository;


    public Map<String, Object> getDashboard(Long userId) {
        Map<String, Object> dashboard = new HashMap<>();
        if (userId == null) return dashboard;

        // 1. Review Count
        Date now = new Date();
        long reviewCount = userVocabularyLearningRepository.countDueReviewsByUserId(userId, now);
        dashboard.put("reviewCount", reviewCount);

        // 2. New Word Count & Total Words
        long totalWordsCount = vocabularyRepository.count();
        List<UserVocabularyLearning> userWords = userVocabularyLearningRepository.findByUser_Id(userId);
        System.out.println("DEBUG: Found " + userWords.size() + " learning records for user " + userId);
        
        long newWordCount = Math.max(0, totalWordsCount - userWords.size());
        dashboard.put("newWordCount", newWordCount);
        dashboard.put("totalPossible", totalWordsCount);

        // 3. Level Distribution
        Map<Integer, Long> distribution = new HashMap<>();
        for (int i = 1; i <= 6; i++) distribution.put(i, 0L);
        
        Date nextReview = null;
        for (UserVocabularyLearning uvl : userWords) {
            Integer lvl = uvl.getDifficultyLevel();
            String wordStr = uvl.vocabulary != null ? uvl.vocabulary.word : (uvl.customVocab != null ? uvl.customVocab.word : "unknown");
            System.out.println("DEBUG: Word=" + wordStr + ", Diff=" + uvl.difficulty + ", Level=" + lvl + ", NextReview=" + uvl.nextReview);
            
            if (lvl != null && lvl >= 1 && lvl <= 6) {
                distribution.put(lvl, distribution.get(lvl) + 1);
            }
            
            if (uvl.nextReview != null) {
                if (nextReview == null || uvl.nextReview.before(nextReview)) {
                    nextReview = uvl.nextReview;
                }
            }
        }
        dashboard.put("levelDistribution", distribution);
        dashboard.put("nextReviewTime", nextReview);

        // 4. Review Words (Golden Time List)
        List<Map<String, Object>> reviewWords = new ArrayList<>();
        List<UserVocabularyLearning> dueWords = userVocabularyLearningRepository.findDueReviewsByUserId(userId, now);
        for (UserVocabularyLearning uvl : dueWords.stream().limit(10).collect(Collectors.toList())) {
            Map<String, Object> wordMap = new HashMap<>();
            if (uvl.vocabulary != null) {
                wordMap.put("word", uvl.vocabulary.word);
                wordMap.put("phonetic", uvl.vocabulary.pronunciation);
                wordMap.put("meaning", uvl.vocabulary.meaningVi);
                wordMap.put("isCustom", false);
            } else if (uvl.customVocab != null) {
                wordMap.put("word", uvl.customVocab.word);
                wordMap.put("phonetic", uvl.customVocab.phonetic);
                wordMap.put("meaning", uvl.customVocab.meaningVi);
                wordMap.put("isCustom", true);
            }
            wordMap.put("level", uvl.getDifficultyLevel());
            reviewWords.add(wordMap);
        }
        dashboard.put("reviewWords", reviewWords);

        // 5. Stats from UserStats
        dashboard.put("totalLearned", (long) userWords.size()); // Use actual learning records count
        
        Optional<UserStats> statsOpt = userStatsRepository.findByUser_Id(userId);
        if (statsOpt.isPresent()) {
            UserStats stats = statsOpt.get();
            dashboard.put("streak", stats.streakDays != null ? stats.streakDays : 0);
        } else {
            dashboard.put("streak", 0);
        }

        return dashboard;
    }

    public List<Map<String, Object>> getSuggestedVocab(Long userId) {
        List<Vocabulary> suggestions;
        if (userId != null) {
            // Fetch words user hasn't learned yet
            suggestions = vocabularyRepository.findNewWordsForUser(userId, PageRequest.of(0, 8));
        } else {
            // For guests, just fetch latest words
            suggestions = vocabularyRepository.findAll(PageRequest.of(0, 8)).getContent();
        }

        if (suggestions.isEmpty()) {
            return Collections.emptyList();
        }

        return suggestions.stream().map(v -> {
            Map<String, Object> map = new HashMap<>();
            map.put("word", v.word);
            map.put("phonetic", v.pronunciation != null ? v.pronunciation : "/.../");
            map.put("meaningEn", v.meaningEn);
            map.put("meaningVi", v.meaningVi);
            map.put("example", v.example);
            map.put("pos", v.partOfSpeech);
            return map;
        }).collect(Collectors.toList());
    }

    public List<Map<String, String>> getSuggestedContent(Long userId) {
        List<Map<String, String>> content = new ArrayList<>();

        // Fetch latest published articles
        List<UserReadingArticleProjection> articles = articleRepository.findArticlesForUser(null);

        if (articles != null && !articles.isEmpty()) {
            articles.stream().limit(5).forEach(a -> {
                content.add(Map.of("type", "article", "title", a.getTitle()));
            });
        }

        // Fallback or additional hardcoded tips/videos if needed
        if (content.size() < 3) {
            content.add(Map.of("type", "tip", "title", "Hãy dành 15 phút mỗi ngày để ôn tập từ vựng mới."));
            content.add(Map.of("type", "video", "title", "Cách phát âm bảng IPA chuẩn bản xứ"));
        }

        return content;
    }

    public Map<String, Object> getTodayVocab(Long userId) {
        Map<String, Object> vocab = new HashMap<>();

        // Get a "random" word based on current hour/day for variety
        long totalCount = vocabularyRepository.count();
        if (totalCount > 0) {
            int randomOffset = (int) (System.currentTimeMillis() % totalCount);
            List<Vocabulary> randomWordList = vocabularyRepository.findAll(PageRequest.of(randomOffset, 1))
                    .getContent();

            if (!randomWordList.isEmpty()) {
                Vocabulary v = randomWordList.get(0);
                vocab.put("word", v.word);
                vocab.put("pronunciationUK", v.pronunciation != null ? v.pronunciation : "/.../");
                vocab.put("pronunciationUS", v.pronunciation != null ? v.pronunciation : "/.../");
                vocab.put("definition", v.meaningEn != null ? v.meaningEn : "No definition available");
                vocab.put("example", v.example != null ? v.example : "No example provided");
                return vocab;
            }
        }

        // Fallback
        vocab.put("word", "resilient");
        vocab.put("pronunciationUK", "/rɪˈzɪliənt/");
        vocab.put("pronunciationUS", "/rɪˈzɪliənt/");
        vocab.put("definition", "able to withstand or recover quickly from difficult conditions");
        vocab.put("example", "She is a resilient girl who never gives up.");
        return vocab;
    }

    public List<Map<String, String>> getNewsFeed(Long userId) {
        List<Map<String, String>> news = new ArrayList<>();
        news.add(Map.of("title", "Mẹo học trong 15 phút mỗi ngày", "description",
                "Gợi ý cách chia phiên học ngắn để vẫn giữ hiệu quả và duy trì streak."));
        news.add(Map.of("title", "Cập nhật tính năng mới", "description",
                "Bạn có thể xem lại phát âm bản xứ trực tiếp tại trang chủ."));
        return news;
    }

    /**
     * Get premium status for a user
     * 
     * @param userId User ID to check
     * @return Map with isPremium, status, and premiumUntil fields
     */
    public Map<String, Object> getPremiumStatus(Long userId) {
        Map<String, Object> response = new HashMap<>();

        try {
            Date now = new Date();
            List<UserSubscription> activeSubscriptions = userSubscriptionRepository
                    .findActiveSubscriptionsByUserId(userId, now);

            List<PremiumFeatureLimit> featureLimits;
            if (!activeSubscriptions.isEmpty()) {
                // Get the latest active subscription
                UserSubscription subscription = activeSubscriptions.get(0);
                response.put("isPremium", true);
                response.put("status", "active");
                response.put("premiumUntil", subscription.endDate);
                
                if (subscription.plan != null) {
                    response.put("planId", subscription.plan.id);
                    response.put("planName", subscription.plan.name);
                    featureLimits = premiumFeatureLimitRepository.findByPlanId(subscription.plan.id);
                } else {
                    response.put("planId", null);
                    response.put("planName", "Premium");
                    featureLimits = new ArrayList<>();
                }
            } else {
                response.put("isPremium", false);
                response.put("status", "free");
                response.put("premiumUntil", null);
                
                // Fetch limits from "Free" plan if it exists
                Optional<PremiumPlan> freePlan = premiumPlanRepository.findByName("Free");
                if (freePlan.isPresent()) {
                    response.put("planId", freePlan.get().id);
                    response.put("planName", "Free");
                    featureLimits = premiumFeatureLimitRepository.findByPlanId(freePlan.get().id);
                } else {
                    featureLimits = new ArrayList<>();
                }
            }

            // Map limits to a cleaner format for frontend
            Map<String, Object> limitsMap = new HashMap<>();
            for (PremiumFeatureLimit limit : featureLimits) {
                Map<String, Object> limitDetails = new HashMap<>();
                limitDetails.put("FREE_LIMIT", limit.getUsageLimit());
                limitDetails.put("IS_LOCKED", limit.getIsLocked());
                limitDetails.put("PREMIUM_UNLIMITED", true); // Usually true for premium
                limitsMap.put(limit.getFeatureName(), limitDetails);
            }
            response.put("featureLimits", limitsMap);

        } catch (Exception e) {
            response.put("isPremium", false);
            response.put("status", "error");
            response.put("premiumUntil", null);
            response.put("featureLimits", new HashMap<>());
        }

        return response;
    }
}
