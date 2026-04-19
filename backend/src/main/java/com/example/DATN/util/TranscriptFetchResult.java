package com.example.DATN.util;

import com.example.DATN.dto.TranscriptChunkDto;
import java.util.List;

/**
 * Internal result class cho YouTube transcript fetching.
 * Chứa transcript text + chunks data từ YouTube API.
 */
public class TranscriptFetchResult {
    public String transcript;
    public List<TranscriptChunkDto> chunks;
    public String language;
    public String source;  // "json3" hoặc "html"

    public TranscriptFetchResult(String transcript, List<TranscriptChunkDto> chunks, String language, String source) {
        this.transcript = transcript;
        this.chunks = chunks;
        this.language = language;
        this.source = source;
    }
}
