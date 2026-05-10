package com.example.DATN.dto.common;

public record AuthLoginRequest(
        String email,
        String password
) {
}
