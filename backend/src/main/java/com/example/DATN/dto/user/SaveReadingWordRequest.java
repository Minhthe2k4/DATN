package com.example.DATN.dto.user;

public record SaveReadingWordRequest(
        Long userId,
        Long articleId,
        String word,
        String pronunciation,
        String typeOfWord,
        String meaningEn,
        String meaningVi,
        String example,
        String exampleVi,
        Boolean addToSRS
) {
}
