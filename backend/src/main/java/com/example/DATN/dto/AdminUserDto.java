package com.example.DATN.dto;

import java.util.Date;

public record AdminUserDto(
        Long id,
        String username,
        String email,
        String fullName,
        String role,
        Date registeredAt,
        int learnedWords,
        Date lastActivityAt,
        boolean premium,
        Date premiumUntil,
        String status,
        boolean active
) {
}
