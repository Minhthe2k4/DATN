package com.example.DATN.dto;

public record SaveReadingWordRequest(
        Long userId,
        Long articleId,
        String word,
        String pronunciation,
        String partOfSpeech,
        String meaningEn,
        String meaningVi,
        String example,
        String exampleVi
) {
}
