package com.example.DATN.dto.admin;

public record UpdateAdminUserRequest(
        String username,
        String email,
        String fullName,
        String role,
        String password,
        String avatar,
        String phoneNumber
) {
}
