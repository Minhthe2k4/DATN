package com.example.DATN.dto;

public record ReadingWordLookupRequest(
        Long userId,
        Long articleId,
        Long videoId,
        String word,
        String sentence
) {
}
