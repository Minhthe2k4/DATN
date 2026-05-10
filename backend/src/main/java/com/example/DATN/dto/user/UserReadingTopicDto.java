package com.example.DATN.dto.user;

public record UserReadingTopicDto(
        Long id,
        String name,
        String description,
        String defaultDifficulty,
        String articleTopicImage,
        Long articleCount
) {
}
