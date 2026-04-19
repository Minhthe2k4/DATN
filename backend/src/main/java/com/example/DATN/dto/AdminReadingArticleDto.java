package com.example.DATN.dto;

public record AdminReadingArticleDto(
        Long id,
        String title,
        Long topicId,
        String topic,
        String difficulty,
        String content,
        String articleImage,
        java.util.Date createdAt,
        int wordsHighlighted,
        String sourceUrl,
        String status
) {
}
