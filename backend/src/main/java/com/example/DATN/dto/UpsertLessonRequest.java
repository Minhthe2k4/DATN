package com.example.DATN.dto;

public record UpsertLessonRequest(
                String name,
                String description,
                Long topicId,
                String difficulty,
                String status,
                String lessonImage,
                Boolean isPremium) {
}
