package com.example.DATN.controller;

import com.example.DATN.entity.User;
import com.example.DATN.entity.UserVocabularyCustom;
import com.example.DATN.repository.UserRepository;
import com.example.DATN.repository.UserVocabularyCustomRepository;
import com.example.DATN.service.SpacedRepetitionService;
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

    private Long getUserIdFromAuth(Authentication auth, HttpServletRequest request) {
        if (auth != null && !auth.getName().equals("anonymousUser")) {
            try { return Long.parseLong(auth.getName()); } catch (Exception ignored) {}
        }
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            try { return Long.parseLong(bearerToken.substring(7)); } catch (Exception ignored) {}
        }
        return null;
    }

    @PostMapping("/initialize")
    public ResponseEntity<?> initializeLearning(@RequestBody Map<String, Object> payload, Authentication auth, HttpServletRequest request) {
        Long userId = getUserIdFromAuth(auth, request);
        if (userId == null) return ResponseEntity.status(401).body("Unauthorized");

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return ResponseEntity.status(404).body("User not found");

        Long customVocabId = payload.get("customVocabId") != null ? Long.valueOf(payload.get("customVocabId").toString()) : null;
        
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
