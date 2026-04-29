package com.example.DATN.dto;

public record CreateSupportTicketRequest(
        String topic,
        String message,
        String email,
        String name
) {
    public record ReplyRequest(String message) {}
}
