package com.example.DATN.dto;

import java.util.Date;

public record AdminPremiumRequestDto(
        Long id,
        Long userId,
        Long subscriptionId,
        String email,
        String packageName,
        Date requestedAt,
        String status
) {
}
