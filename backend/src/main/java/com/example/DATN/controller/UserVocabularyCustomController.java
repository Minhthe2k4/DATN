package com.example.DATN.controller;

import com.example.DATN.dto.SaveCustomVocabularyRequest;
import com.example.DATN.dto.UserVocabularyCustomDto;
import com.example.DATN.entity.User;
import com.example.DATN.entity.UserVocabularyCustom;
import com.example.DATN.repository.UserRepository;
import com.example.DATN.service.UserHomepageService;
import com.example.DATN.service.UserVocabularyCustomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user/vocab-custom")
public class UserVocabularyCustomController {
    @Autowired
    private UserVocabularyCustomService userVocabularyCustomService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserHomepageService userHomepageService;

    private Long getUserIdFromAuth(Authentication auth, HttpServletRequest request) {
        // 1. Try to get from Spring Security Auth
        if (auth != null && !auth.getName().equals("anonymousUser")) {
            try {
                return Long.parseLong(auth.getName());
            } catch (Exception ignored) {}
        }
        
        // 2. Fallback: Parse Bearer token manually from header
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            try {
                String token = bearerToken.substring(7);
                return Long.parseLong(token);
            } catch (Exception ignored) {}
        }
        
        return null;
    }

    @PostMapping("/save")
    public ResponseEntity<?> saveCustomVocab(
            @RequestBody UserVocabularyCustom vocab,
            Authentication auth,
            HttpServletRequest httpRequest) {
        try {
            Long userId = getUserIdFromAuth(auth, httpRequest);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Vui lòng đăng nhập để lưu từ vựng.");
            }

            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
            }

            // Check if word already exists for this user (Step 8b)
            if (userVocabularyCustomService.existsByUserIdAndWord(userId, vocab.word)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Từ đã được lưu");
            }

            // Check Premium Limit
            Map<String, Object> premiumStatus = userHomepageService.getPremiumStatus(userId);
            Map<String, Object> featureLimits = (Map<String, Object>) premiumStatus.get("featureLimits");
            Map<String, Object> vocabLimit = (Map<String, Object>) featureLimits.get("SAVED_VOCABULARY");
            
            // If limit exists and user is not premium (or limit is strictly enforced)
            int limit = vocabLimit != null ? (int) vocabLimit.get("FREE_LIMIT") : 50; // Default 50
            boolean isPremium = (boolean) premiumStatus.get("isPremium");
            
            if (!isPremium) {
                long currentCount = userVocabularyCustomService.countByUser_Id(userId);
                if (currentCount >= limit) {
                    return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED)
                        .body("Bạn đã đạt giới hạn lưu từ vựng (" + limit + " từ). Vui lòng nâng cấp Premium để lưu thêm!");
                }
            }

            vocab.user = user;
            UserVocabularyCustom saved = userVocabularyCustomService.save(vocab);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error saving vocabulary: " + e.getMessage());
        }
    }

    @PostMapping("/save-multiple")
    public ResponseEntity<?> saveMultipleCustomVocab(
            @RequestBody SaveCustomVocabularyRequest request,
            Authentication auth,
            HttpServletRequest httpRequest) {
        try {
            Long userId = getUserIdFromAuth(auth, httpRequest);
            
            // If not authenticated, create temp user or skip user association
            if (userId == null) {
                // For unauthenticated users, we'll save vocabularies without user association
                // This allows the frontend to save locally while syncing to backend later
                List<UserVocabularyCustom> vocabularies = new ArrayList<>();
                for (SaveCustomVocabularyRequest.CustomVocabularyItem item : request.vocabularies) {
                    UserVocabularyCustom vocab = new UserVocabularyCustom();
                    vocab.word = item.word;
                    vocab.phonetic = item.phonetic;
                    vocab.meaningEn = item.meaningEn;
                    vocab.meaningVi = item.meaningVi;
                    vocab.example = item.example;
                    vocab.level = item.level;
                    vocab.levelSource = item.levelSource;
                    // Skip user association for unauthenticated requests
                    vocabularies.add(vocab);
                }
                // Return success without saving to DB if no user
                Map<String, Object> response = new HashMap<>();
                response.put("status", "local_storage");
                response.put("message", "Vocabularies saved to local storage. Login to sync with server.");
                response.put("count", vocabularies.size());
                return ResponseEntity.ok(response);
            }

            List<UserVocabularyCustom> vocabularies = new ArrayList<>();
            for (SaveCustomVocabularyRequest.CustomVocabularyItem item : request.vocabularies) {
                UserVocabularyCustom vocab = new UserVocabularyCustom();
                vocab.word = item.word;
                vocab.phonetic = item.phonetic;
                vocab.meaningEn = item.meaningEn;
                vocab.meaningVi = item.meaningVi;
                vocab.example = item.example;
                vocab.exampleVi = item.exampleVi;
                vocab.level = item.level;
                vocab.levelSource = item.levelSource;
                vocabularies.add(vocab);
            }

            List<UserVocabularyCustom> saved = userVocabularyCustomService.saveMultiple(vocabularies, userId);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error saving vocabularies: " + e.getMessage());
        }
    }

    @GetMapping("/list")
    public ResponseEntity<?> getUserCustomVocabularies(Authentication auth, HttpServletRequest httpRequest) {
        try {
            Long userId = getUserIdFromAuth(auth, httpRequest);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Vui lòng đăng nhập để xem danh sách từ vựng.");
            }

            List<UserVocabularyCustom> vocabs = userVocabularyCustomService.getUserCustomVocabularies(userId);
            List<UserVocabularyCustomDto> dtos = new ArrayList<>();
            for (UserVocabularyCustom vocab : vocabs) {
                dtos.add(new UserVocabularyCustomDto(
                        vocab.id, vocab.word, vocab.pronunciation, vocab.phonetic,
                        vocab.partOfSpeech, vocab.meaningEn, vocab.meaningVi,
                        vocab.example, vocab.exampleVi, vocab.level, vocab.levelSource,
                        vocab.createdAt, vocab.updatedAt
                ));
            }
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving vocabularies: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCustomVocabulary(
            @PathVariable Long id,
            Authentication auth,
            HttpServletRequest httpRequest) {
        try {
            Long userId = getUserIdFromAuth(auth, httpRequest);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Vui lòng đăng nhập.");
            }

            UserVocabularyCustom vocab = userVocabularyCustomService.getById(id);
            if (vocab == null || !vocab.user.id.equals(userId)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Vocabulary not found or unauthorized");
            }

            UserVocabularyCustomDto dto = new UserVocabularyCustomDto(
                    vocab.id, vocab.word, vocab.pronunciation, vocab.phonetic,
                    vocab.partOfSpeech, vocab.meaningEn, vocab.meaningVi,
                    vocab.example, vocab.exampleVi, vocab.level, vocab.levelSource,
                    vocab.createdAt, vocab.updatedAt
            );
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving vocabulary: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCustomVocabulary(
            @PathVariable Long id,
            @RequestBody UserVocabularyCustom vocabUpdates,
            Authentication auth,
            HttpServletRequest httpRequest) {
        try {
            Long userId = getUserIdFromAuth(auth, httpRequest);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Vui lòng đăng nhập.");
            }

            UserVocabularyCustom existing = userVocabularyCustomService.getById(id);
            if (existing == null || !existing.user.id.equals(userId)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Vocabulary not found or unauthorized");
            }

            UserVocabularyCustom updated = userVocabularyCustomService.update(id, vocabUpdates);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating vocabulary: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCustomVocabulary(
            @PathVariable Long id,
            Authentication auth,
            HttpServletRequest httpRequest) {
        try {
            Long userId = getUserIdFromAuth(auth, httpRequest);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Vui lòng đăng nhập.");
            }

            UserVocabularyCustom existing = userVocabularyCustomService.getById(id);
            if (existing == null || !existing.user.id.equals(userId)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Vocabulary not found or unauthorized");
            }

            userVocabularyCustomService.delete(id);
            return ResponseEntity.ok("Vocabulary deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting vocabulary: " + e.getMessage());
        }
    }
}
