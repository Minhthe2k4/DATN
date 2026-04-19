package com.example.DATN.dto;

public record AdminVocabularyDto(
        Long id,
        String word,
        String pronunciation,
        String partOfSpeech,
        String meaningEn,
        String meaningVi,
        String example,
        String exampleVi,
        String level,
        String status,
        Long lessonId,
        Long topicId
) {
}
