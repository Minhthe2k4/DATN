package com.example.DATN.dto;

public record ManualPremiumExtendRequest(
        Integer durationDays,
        String reason,
        String adminActor
) {
}
