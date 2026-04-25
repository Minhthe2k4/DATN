package com.example.DATN.controller;

import com.example.DATN.dto.*;
import com.example.DATN.service.AuthService;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping("/forgot-password")
    public void forgotPassword(@RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request.email());
    }

    @PostMapping("/verify-otp")
    public boolean verifyOtp(@RequestBody VerifyOtpRequest request) {
        return authService.verifyOtp(request.email(), request.otp());
    }

    @PostMapping("/reset-password")
    public void resetPassword(@RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
    }

    @PostMapping("/google-login")
    public AuthUserResponse loginWithGoogle(@RequestBody java.util.Map<String, String> body) {
        String idToken = body.get("idToken");
        return authService.loginWithGoogle(idToken);
    }
}
