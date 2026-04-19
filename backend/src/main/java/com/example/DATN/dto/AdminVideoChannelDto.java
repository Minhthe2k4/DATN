package com.example.DATN.dto;

public record AdminVideoChannelDto(
        Long id,
        String name,
        String handle,
        String topic,
        long videoCount,
        String status
) {
}
