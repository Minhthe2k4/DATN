package com.example.DATN.controller.common;

import com.example.DATN.dto.common.*;

import com.example.DATN.service.common.AuthService;
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

    @PostMapping("/activate")
    public AuthUserResponse activate(@RequestBody VerifyOtpRequest request) {
        return authService.activateAccount(request.email(), request.otp());
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

    @GetMapping("/verify")
    public AuthUserResponse verify(org.springframework.security.core.Authentication auth) {
        return authService.getCurrentUserResponse(auth);
    }

}
