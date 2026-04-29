package com.example.DATN.dto;

public record UpsertTopicRequest(
                String name,
                String description,
                String status,
                String topicImage) {
}
