package com.example.DATN.dto;

import java.time.LocalDateTime;

public record AdminSupportResponseDto(
        Long id,
        Long adminId,
        String adminEmail,
        String response,
        LocalDateTime createdAt
) {
}
