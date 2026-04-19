package com.example.DATN.dto;

/**
 * DTO đơn giản cho kênh YouTube - dành cho người dùng thường xem
 */
public record UserVideoChannelDto(
        Long id,
        String name,
        String url,
        String handle,
        String description,
        Integer subscriberCount,
        Long videoCount
) {
}
