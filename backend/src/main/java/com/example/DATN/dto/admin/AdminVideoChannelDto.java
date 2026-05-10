package com.example.DATN.dto.admin;

import java.util.Date;

public record AdminVideoChannelDto(
        Long id,
        String name,
        String handle,
        String url,
        String description,
        Long subscriberCount,
        long videoCount,
        String status,
        String avatar,
        Date createdAt,
        Date updatedAt,
        Date deletedAt
) {
}
