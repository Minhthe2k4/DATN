package com.example.DATN.controller;

import com.example.DATN.service.UserHomepageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class UserHomepageController {
    @Autowired
    private UserHomepageService userHomepageService;

    private Long getUserIdFromAuth(Authentication auth, HttpServletRequest request) {
        System.out.println("DEBUG: Authentication name = " + (auth != null ? auth.getName() : "null"));
        if (auth != null && !auth.getName().equals("anonymousUser")) {
            try { 
                Long id = Long.parseLong(auth.getName()); 
                System.out.println("DEBUG: Parsed ID from Auth = " + id);
                return id;
            } catch (Exception ignored) {}
        }
        String bearerToken = request.getHeader("Authorization");
        System.out.println("DEBUG: Authorization Header = " + bearerToken);
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            try { 
                Long id = Long.parseLong(bearerToken.substring(7)); 
                System.out.println("DEBUG: Parsed ID from Bearer = " + id);
                return id;
            } catch (Exception ignored) {}
        }
        System.out.println("DEBUG: Failed to identify user.");
        return null;
    }

    @GetMapping("/user/dashboard")
    public ResponseEntity<?> getDashboard(Authentication auth, HttpServletRequest request) {
        Long userId = getUserIdFromAuth(auth, request);
        if (userId == null) {
            return ResponseEntity.status(401).body("Vui lòng đăng nhập.");
        }
        return ResponseEntity.ok(userHomepageService.getDashboard(userId));
    }

    @GetMapping("/user/suggested-vocab")
    public ResponseEntity<?> getSuggestedVocab(Authentication auth, HttpServletRequest request) {
        Long userId = getUserIdFromAuth(auth, request);
        return ResponseEntity.ok(userHomepageService.getSuggestedVocab(userId));
    }

    @GetMapping("/user/suggested-content")
    public ResponseEntity<?> getSuggestedContent(Authentication auth, HttpServletRequest request) {
        Long userId = getUserIdFromAuth(auth, request);
        return ResponseEntity.ok(userHomepageService.getSuggestedContent(userId));
    }

    @GetMapping("/user/today-vocab")
    public ResponseEntity<?> getTodayVocab(Authentication auth, HttpServletRequest request) {
        Long userId = getUserIdFromAuth(auth, request);
        return ResponseEntity.ok(userHomepageService.getTodayVocab(userId));
    }

    @GetMapping("/user/news-feed")
    public ResponseEntity<?> getNewsFeed(Authentication auth, HttpServletRequest request) {
        Long userId = getUserIdFromAuth(auth, request);
        return ResponseEntity.ok(userHomepageService.getNewsFeed(userId));
    }

    /**
     * Get premium status for a user
     * Returns: { isPremium: boolean, status: string, premiumUntil: Date|null }
     */
    @GetMapping("/users/{userId}/premium-status")
    public ResponseEntity<?> getPremiumStatus(@PathVariable Long userId) {
        try {
            Map<String, Object> status = userHomepageService.getPremiumStatus(userId);
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
