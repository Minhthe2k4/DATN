package com.example.DATN.dto;

public record UpdateAdminUserRequest(
        String username,
        String email,
        String fullName,
        String role
) {
}
