package com.example.DATN.dto;

public record UpsertVideoChannelRequest(
        String name,
        String handle,
        String topic,
        String status
) {
}
