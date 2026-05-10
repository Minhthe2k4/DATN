package com.example.DATN.dto.admin;

public record UpsertLessonRequest(
                String name,
                String description,
                Long topicId,
                String difficulty,
                String status,
                String lessonImage,
                Boolean isPremium) {
}
