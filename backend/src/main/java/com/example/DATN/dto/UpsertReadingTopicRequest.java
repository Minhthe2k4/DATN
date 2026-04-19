package com.example.DATN.dto;

import com.fasterxml.jackson.annotation.JsonAlias;

public record UpsertReadingTopicRequest(
        String name,
        String description,
        String defaultDifficulty,
        String status,
        @JsonAlias({"article_topic_image", "articleTopicImage"}) String articleTopicImage
) {
}
