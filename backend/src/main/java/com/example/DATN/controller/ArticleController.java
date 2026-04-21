package com.example.DATN.controller;

import com.example.DATN.dto.ReadingWordLookupRequest;
import com.example.DATN.dto.ReadingWordLookupResponse;
import com.example.DATN.dto.SaveReadingWordRequest;
import com.example.DATN.dto.UserReadingArticleDto;
import com.example.DATN.dto.UserReadingTopicDto;
import com.example.DATN.repository.ArticleRepository;
import com.example.DATN.repository.ArticleTopicRepository;
import com.example.DATN.repository.UserReadingArticleProjection;
import com.example.DATN.repository.UserReadingTopicProjection;
import com.example.DATN.service.ReadingDictionaryService;
import java.util.Date;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/article")
public class ArticleController {
    @Autowired
    private ArticleRepository articleRepository;
    @Autowired
    private ArticleTopicRepository articleTopicRepository;
    @Autowired
    private ReadingDictionaryService readingDictionaryService;
    @Autowired
    private com.example.DATN.service.PremiumService premiumService;

    // Lấy danh sách chủ đề bài báo cho user
    @GetMapping("/topics")
    public List<UserReadingTopicDto> getAllTopics() {
        return articleTopicRepository.findActiveTopicsForUser().stream()
                .map(topic -> new UserReadingTopicDto(
                        topic.getId(),
                        defaultString(topic.getName(), ""),
                        defaultString(topic.getDescription(), ""),
                        defaultString(topic.getLevel(), "Trung bình"),
                        defaultString(topic.getArticleTopicImage(), ""),
                        topic.getArticleCount() == null ? 0L : topic.getArticleCount()))
                .toList();
    }

    // Lấy danh sách bài báo theo topicId
    @GetMapping("/list")
    public List<UserReadingArticleDto> getArticlesByTopic(@RequestParam(required = false) Long topicId) {
        return articleRepository.findArticlesForUser(topicId).stream()
                .map(this::toUserReadingArticleDto)
                .toList();
    }

    @PostMapping("/lookup-word")
    public ReadingWordLookupResponse lookupWord(@RequestBody ReadingWordLookupRequest request) {
        return readingDictionaryService.lookupWord(
                request.word(),
                request.sentence(),
                request.userId(),
                request.articleId());
    }

    @PostMapping("/save-word")
    public com.example.DATN.entity.UserVocabularyCustom saveWord(@RequestBody SaveReadingWordRequest request) {
        return readingDictionaryService.saveWordToPersonalVocabulary(request);
    }

    // Chi tiết bài báo
    @GetMapping("/{articleId:[0-9]+}")
    public UserReadingArticleDto getArticleById(@PathVariable Long articleId) {
        UserReadingArticleProjection row = articleRepository.findArticleForUserById(articleId);
        if (row == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Reading article not found");
        }
        return toUserReadingArticleDto(row);
    }

    @PostMapping("/{articleId:[0-9]+}/check-download-limit")
    public void checkDownloadLimit(@PathVariable Long articleId, @RequestParam Long userId) {
        premiumService.checkAndIncrementDownloadLimit(userId);
    }

    private UserReadingArticleDto toUserReadingArticleDto(UserReadingArticleProjection row) {
        return new UserReadingArticleDto(
                row.getId(),
                defaultString(row.getTitle(), ""),
                defaultString(row.getContent(), ""),
                defaultString(row.getSource(), ""),
                row.getCreatedAt() == null ? new Date() : row.getCreatedAt(),
                defaultString(row.getDifficulty(), "Trung bình"),
                row.getWordsHighlighted() == null ? 0 : row.getWordsHighlighted(),
                defaultString(row.getArticleImage(), ""),
                row.getTopicId(),
                defaultString(row.getTopicName(), ""),
                defaultString(row.getTopicImage(), ""));
    }

    private String defaultString(String value, String fallback) {
        return value == null ? fallback : value;
    }
}
