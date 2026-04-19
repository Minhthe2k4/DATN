package com.example.DATN.dto;

import java.util.Date;

public record UserReadingArticleDto(
        Long id,
        String title,
        String content,
        String source,
        Date createdAt,
        String difficulty,
        Integer wordsHighlighted,
        String articleImage,
        Long topicId,
        String topicName,
        String topicImage
) {
}
