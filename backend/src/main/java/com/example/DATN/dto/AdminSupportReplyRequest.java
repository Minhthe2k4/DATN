package com.example.DATN.dto;

public record AdminSupportReplyRequest(
        Long adminId,
        String adminEmail,
        String response,
        String status
) {
}
