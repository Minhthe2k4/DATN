package com.example.DATN.dto.admin;

public record UpsertVocabularyRequest(
        String word,
        String pronunciation,
        String typeOfWord,
        String meaningEn,
        String meaningVi,
        String example,
        String exampleVi,
        String level,
        String status,
        Long lessonId
) {
}
