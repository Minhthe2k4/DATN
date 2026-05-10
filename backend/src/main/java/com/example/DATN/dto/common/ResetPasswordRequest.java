package com.example.DATN.dto.common;

public record ResetPasswordRequest(
        String email,
        String otp,
        String newPassword
) {
}
