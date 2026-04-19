package com.example.DATN.controller;

import com.example.DATN.dto.AuthLoginRequest;
import com.example.DATN.dto.AuthRegisterRequest;
import com.example.DATN.dto.AuthUserResponse;
import com.example.DATN.service.AuthService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public AuthUserResponse login(@RequestBody AuthLoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/register")
    public AuthUserResponse register(@RequestBody AuthRegisterRequest request) {
        return authService.register(request);
    }
}
