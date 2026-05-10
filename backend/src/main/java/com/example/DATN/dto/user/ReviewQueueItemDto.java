package com.example.DATN.dto.user;

public record ReviewQueueItemDto(
        Long id,
        Long vocabId,
        String word,
        String pronunciation,
        String meaningEn,
        String meaningVi,
        String example,
        String exampleVi,
        String level,
        boolean isCustom,
        java.util.Date nextReview
) {
}
