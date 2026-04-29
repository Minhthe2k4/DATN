package com.example.DATN.dto;

public record AdminReadingTopicDto(
        Long id,
        String name,
        String description,
        String status,
        String articleTopicImage,
        long articleCount,
        java.util.Date createdAt,
        java.util.Date updatedAt,
        java.util.Date deletedAt
) {
}
