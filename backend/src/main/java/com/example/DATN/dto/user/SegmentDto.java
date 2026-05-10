package com.example.DATN.dto.user;

public record SegmentDto(
        Long segmentOrder,
        Double startSec,
        Double endSec,
        String text
) {
}
