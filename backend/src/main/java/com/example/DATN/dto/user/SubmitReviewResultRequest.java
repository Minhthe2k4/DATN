package com.example.DATN.dto.user;

public record SubmitReviewResultRequest(
    Long vocabId,
    boolean isCustom,
    boolean isCorrect,
    Long responseTimeMs
) {}
