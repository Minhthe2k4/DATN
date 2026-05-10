package com.example.DATN.dto.user;

import java.util.List;

public record VideoChannelWithVideosDto(
        Long id,
        String name,
        String url,
        String handle,
        String description,
        Long subscriberCount,
        List<UserVideoDto> videos
) {
}
