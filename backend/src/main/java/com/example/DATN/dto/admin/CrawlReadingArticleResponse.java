package com.example.DATN.dto.admin;

import java.util.Date;

public record CrawlReadingArticleResponse(
        String title,
        String content,
        String articleImage,
        int wordsHighlighted,
        Date createdAt
) {
}
