package com.example.DATN.dto;

public record SubmitReviewResultRequest(
    Long vocabId,
    boolean isCustom,
    boolean isCorrect,
    Long responseTimeMs
) {}
