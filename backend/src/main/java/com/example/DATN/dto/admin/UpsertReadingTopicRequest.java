package com.example.DATN.dto.admin;

import com.fasterxml.jackson.annotation.JsonAlias;

public record UpsertReadingTopicRequest(
        String name,
        String description,
        String status,
        @JsonAlias({"article_topic_image", "articleTopicImage"}) String articleTopicImage
) {
}
