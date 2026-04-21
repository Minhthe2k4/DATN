package com.example.DATN.dto;

public record CreateSupportTicketRequest(
        String topic,
        String message,
        String email
) {
    public record ReplyRequest(String message) {}
}
