package com.example.DATN.dto.user;

import java.util.Date;

public record UserProfileDto(
        Long id,
        String username,
        String email,
        String fullName,
        String avatar,
        String phoneNumber,
        String role,
        Date createdAt,
        Integer totalWords,
        Integer learnedWords,
        Integer streakDays,
        Float accuracy,
        boolean isPremium,
        Date premiumUntil,
        Double totalStudyTime,
        Integer rank
) {
}
