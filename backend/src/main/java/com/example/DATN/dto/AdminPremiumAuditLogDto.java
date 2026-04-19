package com.example.DATN.dto;

import java.util.Date;

public record AdminPremiumAuditLogDto(
        Long id,
        Long userId,
        String email,
        Long transactionId,
        Long subscriptionId,
        String action,
        String statusBefore,
        String statusAfter,
        String reason,
        String adminActor,
        Date createdAt
) {
}
