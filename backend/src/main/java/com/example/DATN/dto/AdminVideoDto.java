package com.example.DATN.dto;

import java.util.Date;

public record AdminVideoDto(
        Long id,
        String title,
        String youtubeUrl,
        Long channelId,
        String channelName,
        String difficulty,
        String duration,
        int wordsHighlighted,
        String status,
        String thumbnail,
        String filePath,
        String subtitleStatus,
        Date createdAt,
        Date updatedAt,
        Date deletedAt
) {
}
