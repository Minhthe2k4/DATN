package com.example.DATN.dto;

/**
 * Request DTO for word lookup
 */
public record WordLookupRequest(
    String word,
    String contextSentence
) {}
