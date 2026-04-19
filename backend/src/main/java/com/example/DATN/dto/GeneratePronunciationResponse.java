package com.example.DATN.dto;

public record GeneratePronunciationResponse(
        String word,
        String pronunciation,
        String source
) {
}
