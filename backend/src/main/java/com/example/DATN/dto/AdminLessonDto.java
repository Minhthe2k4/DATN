package com.example.DATN.dto;

public record AdminLessonDto(
        Long id,
        String name,
        String description,
        Long topicId,
        String difficulty,
        String status,
        String lessonImage,
        Boolean isPremium,
        java.util.Date createdAt,
        java.util.Date updatedAt,
        java.util.Date deletedAt
) {
}
