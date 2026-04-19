package com.example.DATN.dto;

public record AdminSpacedResetCandidateDto(
        Long userId,
        String email,
        String reason,
        Long wordsTracked
) {
}
