package com.example.DATN.dto;

public record AdminTopicDto(
        Long id,
        String name,
        String description,
        long lessons,
        long words,
        String status,
        String topicImage,
        java.util.Date createdAt,
        java.util.Date updatedAt,
        java.util.Date deletedAt
) {
}
