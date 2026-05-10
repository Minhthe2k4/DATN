package com.example.DATN.dto.admin;

public record AdminUserLeaderDto(
    String id,
    String name,
    int streak,
    int learnedWords,
    int completion
) {}
