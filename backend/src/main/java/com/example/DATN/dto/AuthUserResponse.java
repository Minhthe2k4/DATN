package com.example.DATN.dto;

public record AuthUserResponse(
        Long userId,
        String username,
        String fullName,
        String email,
        String role
) {
}
