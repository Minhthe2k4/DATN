package com.example.DATN.service.user;

import com.example.DATN.entity.*;
import com.example.DATN.repository.content.*;
import com.example.DATN.repository.user.*;
import com.example.DATN.repository.learning.*;
import com.example.DATN.repository.premium.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
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
    private VideoRepository videoRepository;

    @Autowired
    private LookupHistoryRepository lookupHistoryRepository;

    @Autowired
    private ArticleTopicRepository articleTopicRepository;

    @Autowired
    private PremiumFeatureLimitRepository premiumFeatureLimitRepository;

    @Autowired
    private PremiumPlanRepository premiumPlanRepository;

    @Autowired
    private UserStatsService userStatsService;

    public Map<String, Object> getDashboard(Long userId) {
        Map<String, Object> dashboard = new HashMap<>();
        if (userId == null)
            return dashboard;

        // Đồng bộ thống kê
        userStatsService.syncStats(userId);

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
        for (int i = 1; i <= 6; i++)
            distribution.put(i, 0L);

        Date nextReview = null;
        for (UserVocabularyLearning uvl : userWords) {
            Integer lvl = uvl.getDifficultyLevel();
            String wordStr = uvl.vocabulary != null ? uvl.vocabulary.word
                    : (uvl.customVocab != null ? uvl.customVocab.word : "unknown");
            System.out.println("DEBUG: Word=" + wordStr + ", Diff=" + uvl.difficulty + ", Level=" + lvl
                    + ", NextReview=" + uvl.nextReview);

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
                wordMap.put("pronunciation", uvl.vocabulary.pronunciation);
                wordMap.put("meaning", uvl.vocabulary.meaningVi);
                wordMap.put("isCustom", false);
            } else if (uvl.customVocab != null) {
                wordMap.put("word", uvl.customVocab.word);
                wordMap.put("pronunciation", uvl.customVocab.pronunciation);
                wordMap.put("meaning", uvl.customVocab.meaningVi);
                wordMap.put("isCustom", true);
            }
            wordMap.put("level", uvl.getDifficultyLevel());
            reviewWords.add(wordMap);
        }
        dashboard.put("reviewWords", reviewWords);

        // 5. Stats from UserStats
        dashboard.put("totalLearned", (long) userWords.size()); // Use actual learning records count

        Optional<UserStats> statsOpt = userStatsRepository.findFirstByUser_Id(userId);
        if (statsOpt.isPresent()) {
            UserStats stats = statsOpt.get();
            dashboard.put("streak", stats.streakDays != null ? stats.streakDays : 0);
        } else {
            dashboard.put("streak", 0);
        }

        return dashboard;
    }

    public List<Map<String, Object>> getSuggestedVocab(Long userId) {
        List<Map<String, Object>> suggested = new ArrayList<>();
        Set<String> seenWords = new HashSet<>();

        // 1. Get words that users searched recently from lookup history
        List<LookupHistory> histories = lookupHistoryRepository.findAll();
        // Sort descending by ID/Creation to get the most recent ones first
        histories.sort((a, b) -> Long.compare(b.id, a.id));

        for (LookupHistory lh : histories) {
            if (lh.word != null && !lh.word.trim().isEmpty()) {
                String w = lh.word.trim().toLowerCase();
                if (!seenWords.contains(w)) {
                    seenWords.add(w);
                    Map<String, Object> map = new HashMap<>();
                    map.put("word", lh.word);
                    map.put("pronunciation", "/.../");
                    map.put("meaningEn", "Tra cứu phổ biến");
                    map.put("meaningVi", "Tra cứu phổ biến");
                    map.put("example", "");
                    map.put("pos", "noun");
                    suggested.add(map);

                    if (suggested.size() >= 8) {
                        break;
                    }
                }
            }
        }

        // 2. Fallback to latest or user new words if less than 8 words found
        if (suggested.size() < 8) {
            List<Vocabulary> suggestions;
            if (userId != null) {
                suggestions = vocabularyRepository.findNewWordsForUser(userId, PageRequest.of(0, 8));
            } else {
                suggestions = vocabularyRepository.findAll(PageRequest.of(0, 8)).getContent();
            }

            for (Vocabulary v : suggestions) {
                String w = v.word.trim().toLowerCase();
                if (!seenWords.contains(w)) {
                    seenWords.add(w);
                    Map<String, Object> map = new HashMap<>();
                    map.put("word", v.word);
                    map.put("pronunciation", v.pronunciation != null ? v.pronunciation : "/.../");
                    map.put("meaningEn", v.meaningEn);
                    map.put("meaningVi", v.meaningVi);
                    map.put("example", v.example);
                    map.put("pos", v.typeOfWord);
                    suggested.add(map);

                    if (suggested.size() >= 8) {
                        break;
                    }
                }
            }
        }

        return suggested;
    }

    public List<Map<String, String>> getSuggestedContent(Long userId) {
        List<Map<String, String>> content = new ArrayList<>();

        Long tempId = 1L;
        List<ArticleTopic> topics = articleTopicRepository.findAll();
        if (topics != null && !topics.isEmpty()) {
            tempId = topics.get(0).id;
        }
        final Long finalTopicId = tempId;

        // 1. Fetch random articles
        List<Article> articles = articleRepository.findAll();
        if (articles != null && !articles.isEmpty()) {
            List<Article> copy = new ArrayList<>(articles);
            Collections.shuffle(copy);
            copy.stream().limit(3).forEach(a -> {
                if (a.title != null && !a.title.trim().isEmpty()) {
                    Map<String, String> map = new HashMap<>();
                    map.put("type", "article");
                    map.put("id", a.id != null ? String.valueOf(a.id) : "");
                    map.put("topicId", (a.topic != null && a.topic.id != null) ? String.valueOf(a.topic.id)
                            : String.valueOf(finalTopicId));
                    map.put("title", a.title);
                    content.add(map);
                }
            });
        }

        // 2. Fetch random videos
        List<Video> videos = videoRepository.findAll();
        if (videos != null && !videos.isEmpty()) {
            List<Video> copy = new ArrayList<>(videos);
            Collections.shuffle(copy);
            copy.stream().limit(3).forEach(v -> {
                if (v.title != null && !v.title.trim().isEmpty()) {
                    Map<String, String> map = new HashMap<>();
                    map.put("type", "video");
                    map.put("id", v.id != null ? String.valueOf(v.id) : "");
                    map.put("channelSlug",
                            (v.channel != null && v.channel.handle != null)
                                    ? v.channel.handle.replace("@", "").toLowerCase()
                                    : (v.channel != null ? "channel-" + v.channel.id : "youtube"));
                    map.put("title", v.title);
                    content.add(map);
                }
            });
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
