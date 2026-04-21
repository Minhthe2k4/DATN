package com.example.DATN.dto;

import java.util.Date;

public record UserLearningVocabDto(
    Long id,               // UserVocabularyLearning record ID
    Long vocabId,          // Original vocab ID (system or custom)
    String word,
    String phonetic,
    String meaningEn,
    String meaningVi,
    String example,
    String exampleVi,
    String level,          // Level from word data (e.g., A1, B2)
    Integer masteryLevel,  // SRS Mastery Level (1-6)
    Integer streakCorrect,
    Date nextReview,
    boolean isCustom
) {}
