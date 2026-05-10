package com.example.DATN.controller.user;

import com.example.DATN.entity.User;
import com.example.DATN.entity.UserVocabularyCustom;
import com.example.DATN.repository.user.UserRepository;
import com.example.DATN.repository.learning.UserVocabularyCustomRepository;
import com.example.DATN.service.user.PremiumService;
import com.example.DATN.service.user.SpacedRepetitionService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user/srs")
public class SRSController {

    @Autowired
    private SpacedRepetitionService spacedRepetitionService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserVocabularyCustomRepository userVocabularyCustomRepository;

    @Autowired
    private PremiumService premiumService;

    private Long getUserIdFromAuth(Authentication auth, HttpServletRequest request) {
        if (auth != null && !auth.getName().equals("anonymousUser")) {
            try {
                return Long.parseLong(auth.getName());
            } catch (Exception ignored) {
            }
        }
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            try {
                return Long.parseLong(bearerToken.substring(7));
            } catch (Exception ignored) {
            }
        }
        return null;
    }

    @PostMapping("/initialize")
    public ResponseEntity<?> initializeLearning(@RequestBody Map<String, Object> payload, Authentication auth,
            HttpServletRequest request) {
        Long userId = getUserIdFromAuth(auth, request);
        if (userId == null)
            return ResponseEntity.status(401).body("Unauthorized");

        User user = userRepository.findById(userId).orElse(null);
        if (user == null)
            return ResponseEntity.status(404).body("User not found");

        // Premium Check for SRS
        try {
            premiumService.checkFeatureAccess(userId, "SRS_GOLDEN_TIME", "Thời điểm vàng");
        } catch (org.springframework.web.server.ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(e.getReason());
        }

        Long customVocabId = payload.get("customVocabId") != null
                ? Long.valueOf(payload.get("customVocabId").toString())
                : null;

        if (customVocabId != null) {
            UserVocabularyCustom customVocab = userVocabularyCustomRepository.findById(customVocabId).orElse(null);
            if (customVocab != null && customVocab.user.id.equals(userId)) {
                spacedRepetitionService.initializeLearning(user, customVocab);
                return ResponseEntity.ok("SRS Initialized for custom vocab");
            }
        }

        return ResponseEntity.badRequest().body("Invalid request");
    }
}
