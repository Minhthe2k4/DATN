package com.example.DATN.dto;

public record LeaderboardDto(
    Integer rank,
    String name,
    String email,
    String avatar,
    Integer score,
    Double studyTime,
    Integer streakDays
) {}
