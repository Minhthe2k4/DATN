package com.example.DATN.dto.admin;

public record AdminSpacedResetCandidateDto(
        Long userId,
        String email,
        String reason,
        Long wordsTracked
) {
}
