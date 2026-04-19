package com.example.DATN.dto;

import java.util.Date;

public record AdminPremiumMemberDto(
        Long subscriptionId,
        Long userId,
        String email,
        String plan,
        Date expiresAt,
        String status
) {
}
