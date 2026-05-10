package com.example.DATN.dto.user;

public record ManualPremiumExtendRequest(
        Integer durationDays,
        String reason,
        String adminActor
) {
}
