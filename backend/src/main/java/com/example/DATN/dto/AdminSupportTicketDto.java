package com.example.DATN.dto;

import java.util.Date;
import java.util.List;

public record AdminSupportTicketDto(
        Long id,
        Long userId,
        String userName,
        String email,
        String topic,
        String message,
        String status,
        Date createdAt,
        List<AdminSupportResponseDto> responses
) {
}
