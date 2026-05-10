package com.example.DATN.dto.admin;

import java.util.List;

import com.example.DATN.dto.user.SegmentDto;

public record UpsertVideoRequest(
                String title,
                String youtubeUrl,
                Long channelId,
                Long topicId,
                String difficulty,
                String duration,
                String status,
                String transcript,
                String thumbnail,
                String filePath,
                String subtitleStatus,
                List<SegmentDto> segments) {
}
