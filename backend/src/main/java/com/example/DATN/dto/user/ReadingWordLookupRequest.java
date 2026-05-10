package com.example.DATN.dto.user;

public record ReadingWordLookupRequest(
        Long userId,
        Long articleId,
        Long videoId,
        String word,
        String sentence,
        Boolean forceRefresh
) {
}
