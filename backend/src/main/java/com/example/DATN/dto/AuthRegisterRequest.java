package com.example.DATN.dto;

public record AuthRegisterRequest(
        String fullName,
        String email,
        String password
) {
}
