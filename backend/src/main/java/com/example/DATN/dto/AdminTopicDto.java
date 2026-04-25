package com.example.DATN.dto;

public record AdminTopicDto(
        Long id,
        String name,
        String description,
        String defaultDifficulty,
        long lessons,
        long words,
        String status,
        String topicImage
) {
}
