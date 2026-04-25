package com.example.DATN.dto;

public record ResetPasswordRequest(
        String email,
        String otp,
        String newPassword
) {
}
