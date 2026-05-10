package com.example.DATN.dto.admin;

public record UpsertTopicRequest(
                String name,
                String description,
                String status,
                String topicImage) {
}
