package com.example.DATN.dto.common;

public record AuthRegisterRequest(
        String fullName,
        String email,
        String phoneNumber,
        String password
) {
}
