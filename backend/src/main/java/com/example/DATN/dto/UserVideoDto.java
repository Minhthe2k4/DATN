package com.example.DATN.dto;

/**
 * DTO đơn giản cho video - dành cho người dùng thường xem
 * Có tất cả thông tin cần để hiển thị video card
 */
public record UserVideoDto(
        Long id,
        String title,
        String youtubeUrl,
        Long channelId,
        String channelName,
        String duration,
        String difficulty,
        String transcript,
        Integer wordsHighlighted,
        String status
) {
}
