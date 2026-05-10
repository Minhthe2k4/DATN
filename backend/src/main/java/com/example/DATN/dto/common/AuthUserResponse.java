package com.example.DATN.dto.common;

public record AuthUserResponse(
        Long userId,
        String username,
        String fullName,
        String email,
        String role,
        String token,
        String avatar
) {
}
