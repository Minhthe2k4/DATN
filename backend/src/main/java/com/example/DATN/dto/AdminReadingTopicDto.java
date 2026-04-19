package com.example.DATN.dto;

public record AdminReadingTopicDto(
        Long id,
        String name,
        String description,
        String defaultDifficulty,
        String status,
        String articleTopicImage,
        long articleCount
) {
}
