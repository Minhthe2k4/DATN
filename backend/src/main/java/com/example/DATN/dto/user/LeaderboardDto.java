package com.example.DATN.dto.user;

public record LeaderboardDto(
    Integer rank,
    String name,
    String email,
    String avatar,
    Integer score,
    Double studyTime,
    Integer streakDays
) {}
