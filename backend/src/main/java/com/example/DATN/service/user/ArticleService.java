package com.example.DATN.service.user;

import com.example.DATN.dto.user.UserReadingArticleDto;
import com.example.DATN.dto.user.UserReadingTopicDto;
import com.example.DATN.repository.content.ArticleRepository;
import com.example.DATN.repository.content.ArticleTopicRepository;
import com.example.DATN.repository.projections.UserReadingArticleProjection;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Date;
import java.util.List;

@Service
public class ArticleService {

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private ArticleTopicRepository articleTopicRepository;

    // Lấy danh sách chủ đề bài báo cho user
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
    public List<UserReadingArticleDto> getArticlesByTopic(Long topicId) {
        return articleRepository.findArticlesForUser(topicId).stream()
                .map(this::toUserReadingArticleDto)
                .toList();
    }

    // Chi tiết bài báo
    public UserReadingArticleDto getArticleById(Long articleId) {
        UserReadingArticleProjection row = articleRepository.findArticleForUserById(articleId);
        if (row == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Reading article not found");
        }
        return toUserReadingArticleDto(row);
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
