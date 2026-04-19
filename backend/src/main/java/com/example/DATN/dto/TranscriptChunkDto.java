package com.example.DATN.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO đại diện một chunk (đoạn nhỏ) của transcript từ YouTube.
 * Dùng cho intermediate processing, không dùng trực tiếp cho frontend.
 */
public class TranscriptChunkDto {
    @JsonProperty("text")
    public String text;

    @JsonProperty("start")
    public Double start;

    @JsonProperty("duration")
    public Double duration;

    @JsonProperty("end")
    public Double end;

    public TranscriptChunkDto() {}

    public TranscriptChunkDto(String text, Double start, Double duration, Double end) {
        this.text = text;
        this.start = start;
        this.duration = duration;
        this.end = end;
    }

    @Override
    public String toString() {
        return "TranscriptChunkDto{" +
                "text='" + text + '\'' +
                ", start=" + start +
                ", duration=" + duration +
                ", end=" + end +
                '}';
    }
}
