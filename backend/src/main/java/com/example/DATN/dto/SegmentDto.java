package com.example.DATN.dto;

public record SegmentDto(
        Long segmentOrder,
        Double startSec,
        Double endSec,
        String text
) {
}
