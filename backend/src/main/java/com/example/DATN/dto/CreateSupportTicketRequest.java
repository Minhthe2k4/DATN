package com.example.DATN.dto;

public record CreateSupportTicketRequest(
        String topic,
        String message
) {
    public record ReplyRequest(String message) {}
}
