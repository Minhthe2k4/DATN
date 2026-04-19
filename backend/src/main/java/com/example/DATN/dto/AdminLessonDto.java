package com.example.DATN.dto;

public record AdminLessonDto(
        Long id,
        String name,
        String description,
        Long topicId,
        String difficulty,
        String status
) {
}
