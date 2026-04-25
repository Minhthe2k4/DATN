package com.example.DATN.controller;

import com.example.DATN.service.UserProfileService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user/profile")
public class UserProfileController {

    @Autowired
    private UserProfileService userProfileService;

    private Long getUserIdFromAuth(Authentication auth, HttpServletRequest request) {
        System.out.println("DEBUG: Profile Auth name = " + (auth != null ? auth.getName() : "null"));
        if (auth != null && !auth.getName().equals("anonymousUser")) {
            try {
                return Long.parseLong(auth.getName());
            } catch (Exception ignored) {
            }
        }
        String bearerToken = request.getHeader("Authorization");
        System.out.println("DEBUG: Profile Auth Header = " + bearerToken);
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            try {
                return Long.parseLong(bearerToken.substring(7));
            } catch (Exception ignored) {
            }
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<?> getProfile(Authentication auth, HttpServletRequest request) {
        Long userId = getUserIdFromAuth(auth, request);
        if (userId == null) {
            return ResponseEntity.status(401).body("Vui lòng đăng nhập.");
        }
        return ResponseEntity.ok(userProfileService.getProfile(userId));
    }

    @PutMapping
    public ResponseEntity<?> updateProfile(
            @RequestBody Map<String, String> body,
            Authentication auth,
            HttpServletRequest request) {
        Long userId = getUserIdFromAuth(auth, request);
        if (userId == null) {
            return ResponseEntity.status(401).body("Vui lòng đăng nhập.");
        }

        String fullName = body.get("fullName");
        String avatar = body.get("avatar");

        return ResponseEntity.ok(userProfileService.updateProfile(userId, fullName, avatar));
    }
}
