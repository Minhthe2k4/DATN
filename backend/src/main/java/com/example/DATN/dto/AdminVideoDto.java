package com.example.DATN.dto;

public record AdminVideoDto(
        Long id,
        String title,
        String youtubeUrl,
        Long channelId,
        String channelName,
        String difficulty,
        String duration,
        int wordsHighlighted,
        String status
) {
}
