package com.example.DATN.dto;

public record AuthLoginRequest(
        String email,
        String password
) {
}
