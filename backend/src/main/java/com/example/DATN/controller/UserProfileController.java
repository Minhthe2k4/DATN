package com.example.DATN.controller;

import com.example.DATN.service.UserProfileService;
import com.example.DATN.util.AuthUtil;
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

    @Autowired
    private com.example.DATN.service.ImageUploadService imageUploadService;


    @GetMapping
    public ResponseEntity<?> getProfile(Authentication auth, HttpServletRequest request) {
        Long userId = AuthUtil.getUserId(auth, request);
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
        Long userId = AuthUtil.getUserId(auth, request);
        if (userId == null) {
            return ResponseEntity.status(401).body("Vui lòng đăng nhập.");
        }

        String fullName = body.get("fullName");
        String avatar = body.get("avatar");
        String phoneNumber = body.get("phoneNumber");

        return ResponseEntity.ok(userProfileService.updateProfile(userId, fullName, avatar, phoneNumber));
    }

    @PostMapping("/avatar")
    public ResponseEntity<?> uploadAvatar(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            Authentication auth,
            HttpServletRequest request) {
        Long userId = AuthUtil.getUserId(auth, request);
        if (userId == null) {
            return ResponseEntity.status(401).body("Vui lòng đăng nhập.");
        }

        try {
            String url = imageUploadService.uploadImage(file, "avatars");
            userProfileService.updateAvatar(userId, url);
            return ResponseEntity.ok(Map.of("url", url));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi upload ảnh: " + e.getMessage());
        }
    }
}
