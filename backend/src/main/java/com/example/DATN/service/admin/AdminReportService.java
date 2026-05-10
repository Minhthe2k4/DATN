package com.example.DATN.service.admin;

import com.example.DATN.repository.content.ArticleRepository;
import com.example.DATN.repository.content.LessonRepository;
import com.example.DATN.repository.content.TopicRepository;
import com.example.DATN.repository.content.VideoRepository;
import com.example.DATN.repository.content.VocabularyRepository;
import com.example.DATN.repository.content.YouTubeChannelRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AdminReportService {

    private final ArticleRepository articleRepository;
    private final VideoRepository videoRepository;
    private final YouTubeChannelRepository youtubeChannelRepository;
    private final TopicRepository topicRepository;
    private final LessonRepository lessonRepository;
    private final VocabularyRepository vocabularyRepository;

    public AdminReportService(ArticleRepository articleRepository,
            VideoRepository videoRepository,
            YouTubeChannelRepository youtubeChannelRepository,
            TopicRepository topicRepository,
            LessonRepository lessonRepository,
            VocabularyRepository vocabularyRepository) {
        this.articleRepository = articleRepository;
        this.videoRepository = videoRepository;
        this.youtubeChannelRepository = youtubeChannelRepository;
        this.topicRepository = topicRepository;
        this.lessonRepository = lessonRepository;
        this.vocabularyRepository = vocabularyRepository;
    }

    public Map<String, Object> getContentSummary() {
        Map<String, Object> summary = new HashMap<>();

        // Reading Stats
        long totalArticles = articleRepository.count();
        long publishedArticles = articleRepository.countByStatus("Đã xuất bản");
        long waitingArticles = articleRepository.countByStatus("Chờ biên tập");
        long draftArticles = articleRepository.countByStatus("Nháp");

        Map<String, Long> readingStats = new HashMap<>();
        readingStats.put("total", totalArticles);
        readingStats.put("published", publishedArticles);
        readingStats.put("waiting", waitingArticles);
        readingStats.put("draft", draftArticles);
        summary.put("reading", readingStats);

        // Video Stats
        long totalChannels = youtubeChannelRepository.count();
        long totalVideos = videoRepository.count();
        long publishedVideos = videoRepository.countByStatus("Đã xuất bản");
        long waitingVideos = videoRepository.countByStatus("Chờ biên tập");

        Map<String, Long> videoStats = new HashMap<>();
        videoStats.put("totalChannels", totalChannels);
        videoStats.put("totalVideos", totalVideos);
        videoStats.put("published", publishedVideos);
        videoStats.put("waiting", waitingVideos);
        summary.put("video", videoStats);

        // Learning Stats: Topics
        long totalTopics = topicRepository.count();
        long activeTopics = topicRepository.countByStatus(true);
        long pausedTopics = topicRepository.countByStatus(false);
        long lessonsAssigned = lessonRepository.count();

        Map<String, Object> topicStats = new HashMap<>();
        topicStats.put("total", totalTopics);
        topicStats.put("active", activeTopics);
        topicStats.put("paused", pausedTopics);
        topicStats.put("lessonsAssigned", lessonsAssigned);
        summary.put("topic", topicStats);

        // Learning Stats: Lessons
        long totalLessons = lessonRepository.count();
        long openLessons = lessonRepository.countByStatus("Đang mở");
        long premiumLessons = lessonRepository.countByIsPremium(true);
        Double avgDifficulty = lessonRepository.calculateAverageDifficulty();

        Map<String, Object> lessonStats = new HashMap<>();
        lessonStats.put("total", totalLessons);
        lessonStats.put("open", openLessons);
        lessonStats.put("premium", premiumLessons);
        lessonStats.put("avgDifficulty", avgDifficulty != null ? avgDifficulty : 0.0);
        summary.put("lesson", lessonStats);

        // Learning Stats: Vocabulary
        long totalVocab = vocabularyRepository.count();
        long approvedVocab = vocabularyRepository.countByStatus("Đã duyệt");
        long pendingVocab = vocabularyRepository.countByStatus("Chờ duyệt");

        Map<String, Object> vocabStats = new HashMap<>();
        vocabStats.put("total", totalVocab);
        vocabStats.put("approved", approvedVocab);
        vocabStats.put("pending", pendingVocab);
        summary.put("vocabulary", vocabStats);

        return summary;
    }
}
