package com.example.DATN.dto;

public record ManualPremiumGrantRequest(
        Long userId,
        String email,
        Long planId,
        Integer durationDays,
        String reason,
        String adminActor
) {
}
