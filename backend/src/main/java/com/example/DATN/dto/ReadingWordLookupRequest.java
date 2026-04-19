package com.example.DATN.dto;

public record ReadingWordLookupRequest(
        Long userId,
        Long articleId,
        String word,
        String sentence
) {
}
