package com.example.DATN.dto.admin;

import java.util.Date;

public record AdminUserDto(
        Long id,
        String username,
        String email,
        String fullname,
        String role,
        String avatar,
        String phoneNumber,
        boolean isActive,
        Date createdAt,
        Date updatedAt,
        Date deletedAt,
        boolean premium,
        Date premiumUntil,
        String status
) {
}
