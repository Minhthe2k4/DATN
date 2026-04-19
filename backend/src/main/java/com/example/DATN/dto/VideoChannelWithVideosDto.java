package com.example.DATN.dto;

import java.util.List;

/**
 * DTO kết hợp kênh và danh sách video - dành cho page chi tiết kênh
 */
public record VideoChannelWithVideosDto(
        Long channelId,
        String channelName,
        String channelUrl,
        String channelHandle,
        String channelDescription,
        Integer subscriberCount,
        List<UserVideoDto> videos
) {
}
