package com.example.DATN.dto.user;

/**
 * Request DTO for word lookup
 */
public record WordLookupRequest(
    String word,
    String contextSentence
) {}
