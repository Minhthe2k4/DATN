package com.example.DATN.dto;

import java.util.List;

public record UpsertVideoRequest(
        String title,
        String youtubeUrl,
        Long channelId,
        Long topicId,
        String difficulty,
        String duration,
        String status,
        String transcript,
        List<SegmentDto> segments
) {
}
