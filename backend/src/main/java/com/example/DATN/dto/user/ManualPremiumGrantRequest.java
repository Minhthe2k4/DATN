package com.example.DATN.dto.user;

public record ManualPremiumGrantRequest(
        Long userId,
        String email,
        Long planId,
        Integer durationDays,
        String reason,
        String adminActor
) {
}
