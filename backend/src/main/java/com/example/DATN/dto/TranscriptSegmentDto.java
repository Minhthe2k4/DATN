package com.example.DATN.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO để biểu diễn một segment của transcript (câu hoặc đoạn).
 * Được dùng cho luyện nghe dictation.
 */
public class TranscriptSegmentDto {
    @JsonProperty("startSec")
    public Double startSec;

    @JsonProperty("endSec")
    public Double endSec;

    @JsonProperty("text")
    public String text;

    @JsonProperty("segmentOrder")
    public Integer segmentOrder;

    public TranscriptSegmentDto() {}

    public TranscriptSegmentDto(Double startSec, Double endSec, String text, Integer segmentOrder) {
        this.startSec = startSec;
        this.endSec = endSec;
        this.text = text;
        this.segmentOrder = segmentOrder;
    }

    @Override
    public String toString() {
        return "TranscriptSegmentDto{" +
                "startSec=" + startSec +
                ", endSec=" + endSec +
                ", text='" + text + '\'' +
                ", segmentOrder=" + segmentOrder +
                '}';
    }
}
