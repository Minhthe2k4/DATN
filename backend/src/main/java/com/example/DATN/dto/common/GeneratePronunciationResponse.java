package com.example.DATN.dto.common;

public record GeneratePronunciationResponse(
        String word,
        String pronunciation,
        String source
) {
}
