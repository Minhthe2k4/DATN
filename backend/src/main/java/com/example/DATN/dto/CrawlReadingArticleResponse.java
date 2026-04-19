package com.example.DATN.dto;

import java.util.Date;

public record CrawlReadingArticleResponse(
        String title,
        String content,
        String articleImage,
        int wordsHighlighted,
        Date createdAt
) {
}
