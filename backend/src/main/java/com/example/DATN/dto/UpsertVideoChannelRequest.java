package com.example.DATN.dto;

public record UpsertVideoChannelRequest(
        String name,
        String handle,
        String url,
        String description,
        Long subscriberCount,
        String status,
        String avatar
) {
}
