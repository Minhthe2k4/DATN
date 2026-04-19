package com.example.DATN.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/**
 * DTO cho response của YouTube transcript fetching.
 * Chứa toàn bộ thông tin: transcript text, segments timing, metadata.
 */
public class TranscriptResponseDto {
    @JsonProperty("videoId")
    public String videoId;

    @JsonProperty("title")
    public String title;

    @JsonProperty("transcript")
    public String transcript;

    @JsonProperty("segments")
    public List<TranscriptSegmentDto> segments;

    @JsonProperty("language")
    public String language;

    @JsonProperty("sourceUrl")
    public String sourceUrl;

    @JsonProperty("error")
    public String error;

    public TranscriptResponseDto() {}

    public TranscriptResponseDto(String videoId, String title, String transcript, 
                                 List<TranscriptSegmentDto> segments, String language, 
                                 String sourceUrl) {
        this.videoId = videoId;
        this.title = title;
        this.transcript = transcript;
        this.segments = segments;
        this.language = language;
        this.sourceUrl = sourceUrl;
        this.error = null;
    }

    public TranscriptResponseDto withError(String errorMsg) {
        this.error = errorMsg;
        return this;
    }

    @Override
    public String toString() {
        return "TranscriptResponseDto{" +
                "videoId='" + videoId + '\'' +
                ", title='" + title + '\'' +
                ", language='" + language + '\'' +
                ", segmentsCount=" + (segments != null ? segments.size() : 0) +
                ", error='" + error + '\'' +
                '}';
    }
}
