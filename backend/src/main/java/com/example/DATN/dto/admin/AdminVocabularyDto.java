package com.example.DATN.dto.admin;

import java.util.Date;

public record AdminVocabularyDto(
        Long id,
        String word,
        String pronunciation,
        String typeOfWord,
        String meaningEn,
        String meaningVi,
        String example,
        String exampleVi,
        String level,
        String status,
        Long lessonId,
        Long topicId,
        Date createdAt,
        Date updatedAt,
        Date deletedAt
) {
}
