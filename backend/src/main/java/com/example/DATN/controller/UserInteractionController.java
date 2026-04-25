package com.example.DATN.controller;

import com.example.DATN.entity.User;
import com.example.DATN.entity.UserFavorite;
import com.example.DATN.entity.UserProgress;
import com.example.DATN.repository.UserFavoriteRepository;
import com.example.DATN.repository.UserProgressRepository;
import com.example.DATN.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/user/interaction")
public class UserInteractionController {

    @Autowired
    private UserFavoriteRepository userFavoriteRepository;

    @Autowired
    private UserProgressRepository userProgressRepository;

    @Autowired
    private UserRepository userRepository;

    private Long getUserIdFromAuth(Authentication auth, HttpServletRequest request) {
        if (auth != null && !auth.getName().equals("anonymousUser")) {
            try {
                return Long.parseLong(auth.getName());
            } catch (Exception ignored) {}
        }
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            try {
                String token = bearerToken.substring(7);
                return Long.parseLong(token);
            } catch (Exception ignored) {}
        }
        return null;
    }

    @PostMapping("/favorite/toggle")
    @Transactional
    public ResponseEntity<?> toggleFavorite(
            @RequestParam Long targetId,
            @RequestParam String targetType,
            Authentication auth,
            HttpServletRequest request) {
        Long userId = getUserIdFromAuth(auth, request);
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");

        Optional<UserFavorite> existing = userFavoriteRepository.findByUserIdAndTargetIdAndTargetType(userId, targetId, targetType);
        
        Map<String, Object> response = new HashMap<>();
        if (existing.isPresent()) {
            userFavoriteRepository.delete(existing.get());
            response.put("isFavorite", false);
        } else {
            User user = userRepository.findById(userId).orElseThrow();
            UserFavorite fav = new UserFavorite(user, targetId, targetType);
            userFavoriteRepository.save(fav);
            response.put("isFavorite", true);
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/favorites/{type}")
    public ResponseEntity<?> getFavorites(@PathVariable String type, Authentication auth, HttpServletRequest request) {
        Long userId = getUserIdFromAuth(auth, request);
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        
        List<UserFavorite> favorites = userFavoriteRepository.findByUserIdAndTargetType(userId, type.toUpperCase());
        return ResponseEntity.ok(favorites);
    }

    @PostMapping("/progress")
    @Transactional
    public ResponseEntity<?> updateProgress(
            @RequestParam Long targetId,
            @RequestParam String targetType,
            @RequestParam Double percent,
            Authentication auth,
            HttpServletRequest request) {
        Long userId = getUserIdFromAuth(auth, request);
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");

        UserProgress progress = userProgressRepository.findByUserIdAndTargetIdAndTargetType(userId, targetId, targetType.toUpperCase())
                .orElse(new UserProgress(userRepository.findById(userId).orElseThrow(), targetId, targetType.toUpperCase(), 0.0));
        
        // Chỉ cập nhật nếu tiến độ mới cao hơn tiến độ cũ (hoặc cho phép cập nhật lùi tùy ý? Thường là chỉ tiến tới)
        if (percent > progress.progressPercent) {
            progress.progressPercent = percent;
            progress.updatedAt = new Date();
            userProgressRepository.save(progress);
        }
        
        return ResponseEntity.ok(progress);
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats(
            @RequestParam Long targetId,
            @RequestParam String targetType,
            Authentication auth,
            HttpServletRequest request) {
        Long userId = getUserIdFromAuth(auth, request);
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");

        Map<String, Object> stats = new HashMap<>();
        stats.put("isFavorite", userFavoriteRepository.existsByUserIdAndTargetIdAndTargetType(userId, targetId, targetType.toUpperCase()));
        
        Optional<UserProgress> progress = userProgressRepository.findByUserIdAndTargetIdAndTargetType(userId, targetId, targetType.toUpperCase());
        stats.put("progressPercent", progress.map(p -> p.progressPercent).orElse(0.0));
        
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/bulk-stats")
    public ResponseEntity<?> getBulkStats(
            @RequestBody Map<String, Object> payload,
            Authentication auth,
            HttpServletRequest request) {
        Long userId = getUserIdFromAuth(auth, request);
        if (userId == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");

        @SuppressWarnings("unchecked")
        List<Integer> targetIdsRaw = (List<Integer>) payload.get("targetIds");
        String targetType = (String) payload.get("targetType");
        
        List<Long> targetIds = targetIdsRaw.stream().map(Integer::longValue).toList();
        
        Map<Long, Map<String, Object>> result = new HashMap<>();
        
        for (Long id : targetIds) {
            Map<String, Object> stats = new HashMap<>();
            stats.put("isFavorite", userFavoriteRepository.existsByUserIdAndTargetIdAndTargetType(userId, id, targetType.toUpperCase()));
            
            Optional<UserProgress> progress = userProgressRepository.findByUserIdAndTargetIdAndTargetType(userId, id, targetType.toUpperCase());
            stats.put("progressPercent", progress.map(p -> p.progressPercent).orElse(0.0));
            
            result.put(id, stats);
        }
        
        return ResponseEntity.ok(result);
    }
}
