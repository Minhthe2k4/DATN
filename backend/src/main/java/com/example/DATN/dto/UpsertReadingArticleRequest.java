package com.example.DATN.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import java.util.Date;

public record UpsertReadingArticleRequest(
        String title,
        Long topicId,
        String difficulty,
        String content,
        @JsonAlias({"article_image", "articleImage"}) String articleImage,
        @JsonAlias({"created_at", "create_at", "createdAt"}) Date createdAt,
        @JsonAlias({"word_highlighted", "words_highlighted", "wordsHighlighted"}) Integer wordsHighlighted,
        String sourceUrl,
        String status
) {
}
