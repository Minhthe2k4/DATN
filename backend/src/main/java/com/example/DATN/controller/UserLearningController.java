package com.example.DATN.controller;

import com.example.DATN.dto.UserLearningStatsDto;
import com.example.DATN.dto.ReviewQueueItemDto;
import com.example.DATN.dto.BulkSubmitReviewResultRequest;
import com.example.DATN.dto.SubmitReviewResultRequest;
import com.example.DATN.entity.UserVocabularyLearning;
import com.example.DATN.entity.Vocabulary;
import com.example.DATN.repository.LessonVocabularyRepository;
import com.example.DATN.repository.UserRepository;
import com.example.DATN.repository.UserVocabularyLearningRepository;
import com.example.DATN.repository.VocabularyRepository;
import com.example.DATN.service.SpacedRepetitionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.util.*;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user/learning")
public class UserLearningController {

    @Autowired
    private UserVocabularyLearningRepository userVocabularyLearningRepository;

    @Autowired
    private SpacedRepetitionService spacedRepetitionService;
    
    @Autowired
    private VocabularyRepository vocabularyRepository;
    
    @Autowired
    private LessonVocabularyRepository lessonVocabularyRepository;
    
    @Autowired
    private UserRepository userRepository;

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

    /**
     * Sub-UC: Lấy hàng đợi ôn tập (UC_LayHangDoiOnTap)
     * Truy vấn tất cả từ vựng đã đến hạn ôn tập (next_review <= Now)
     * để hiển thị cho người dùng trong phiên ôn tập.
     */
    @GetMapping("/review-queue")
    public ResponseEntity<?> getReviewQueue(Authentication auth, HttpServletRequest request) {
        Long userId = getUserIdFromAuth(auth, request);
        if (userId == null) return ResponseEntity.status(401).body("Vui lòng đăng nhập để xem từ vựng cần ôn.");
        
        List<UserVocabularyLearning> dueReviews = userVocabularyLearningRepository.findDueReviewsByUserId(userId, new Date());
        
        List<ReviewQueueItemDto> dtos = dueReviews.stream().map(r -> {
            boolean isCustom = r.customVocab != null;
            Long vocabId = isCustom ? r.customVocab.id : r.vocabulary.id;
            String word = isCustom ? r.customVocab.word : r.vocabulary.word;
            String phonetic = isCustom ? r.customVocab.phonetic : r.vocabulary.pronunciation;
            String meaningEn = isCustom ? r.customVocab.meaningEn : r.vocabulary.meaningEn;
            String meaningVi = isCustom ? r.customVocab.meaningVi : r.vocabulary.meaningVi;
            String example = isCustom ? r.customVocab.example : r.vocabulary.example;
            String exampleVi = isCustom ? r.customVocab.exampleVi : r.vocabulary.exampleVi;
            String level = isCustom 
                ? (r.customVocab.level != null ? String.valueOf(r.customVocab.level) : "") 
                : r.vocabulary.level;

            return new ReviewQueueItemDto(
                r.id,
                vocabId,
                word,
                phonetic,
                meaningEn,
                meaningVi,
                example,
                exampleVi,
                level,
                isCustom,
                r.nextReview
            );
        }).collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/submit-result")
    public ResponseEntity<?> submitReviewResult(
            @RequestBody SubmitReviewResultRequest request,
            Authentication auth,
            HttpServletRequest httpRequest) {
        Long userId = getUserIdFromAuth(auth, httpRequest);
        if (userId == null) return ResponseEntity.status(401).body("Vui lòng đăng nhập.");
        
        spacedRepetitionService.updateProgress(
                userId, 
                request.vocabId(), 
                request.isCustom(), 
                request.isCorrect(),
                request.responseTimeMs()
        );
        
        return ResponseEntity.ok().build();
    }

    /**
     * Sub-UC: Nộp kết quả ôn tập hàng loạt (UC_NopKetQuaHangLoat)
     * Xử lý danh sách kết quả sau khi người dùng hoàn thành một phiên ôn tập.
     * Cập nhật tiến độ từng từ và lưu tổng kết phiên học (ReviewSession).
     */
    @PostMapping("/bulk-submit-results")
    public ResponseEntity<?> submitBulkReviewResults(
            @RequestBody BulkSubmitReviewResultRequest request,
            Authentication auth,
            HttpServletRequest httpRequest) {
        Long userId = getUserIdFromAuth(auth, httpRequest);
        if (userId == null) return ResponseEntity.status(401).body("Vui lòng đăng nhập.");
        
        if (request.results() != null) {
            int total = request.results().size();
            int correct = 0;
            for (SubmitReviewResultRequest r : request.results()) {
                if (r.isCorrect()) correct++;
                spacedRepetitionService.updateProgress(
                    userId, 
                    r.vocabId(), 
                    r.isCustom(), 
                    r.isCorrect(),
                    r.responseTimeMs()
                );
            }
            // Save the session summary
            spacedRepetitionService.createReviewSession(userId, total, correct);
        }
        
        return ResponseEntity.ok().build();
    }

    /**
     * Sub-UC: Bắt đầu học bài học mới (UC_BatDauHocBaiMoi)
     * Khi người dùng nhấn "Học bài này", hệ thống lấy toàn bộ từ vựng trong bài
     * và khởi tạo lộ trình SRS (UC_KhoiTaoHoc) cho từng từ.
     */
    @PostMapping("/complete-lesson/{lessonId}")
    public ResponseEntity<?> completeLesson(@PathVariable Long lessonId, Authentication auth, HttpServletRequest httpRequest) {
        Long userId = getUserIdFromAuth(auth, httpRequest);
        if (userId == null) return ResponseEntity.status(401).body("Vui lòng đăng nhập.");
        
        com.example.DATN.entity.User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).body("User not found");
        }
        
        // Find all vocabulary IDs in this lesson
        List<Long> vocabIds = lessonVocabularyRepository.findVocabIdsByLessonId(lessonId);
        if (vocabIds.isEmpty()) {
            return ResponseEntity.ok("No vocabulary found in this lesson to track");
        }
        
        // Load actual vocab entities
        List<com.example.DATN.entity.Vocabulary> vocabs = vocabularyRepository.findAllById(vocabIds);
        
        // Initialize learning for each
        for (com.example.DATN.entity.Vocabulary v : vocabs) {
            spacedRepetitionService.initializeLearning(user, v);
        }
        
        return ResponseEntity.ok("Đã bắt đầu theo dõi " + vocabs.size() + " từ vựng từ bài học này!");
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats(Authentication auth, HttpServletRequest httpRequest) {
        Long userId = getUserIdFromAuth(auth, httpRequest);
        if (userId == null) {
            // Return empty stats for guests
            return ResponseEntity.ok(new UserLearningStatsDto(0L, vocabularyRepository.count(), 0L, null, new HashMap<>()));
        }
        List<UserVocabularyLearning> records = userVocabularyLearningRepository.findByUser_Id(userId);
        long totalPossible = vocabularyRepository.count();
        
        // 1. Level Distribution
        Map<Integer, Long> distribution = new HashMap<>();
        for (int i = 1; i <= 6; i++) distribution.put(i, 0L);
        
        long dueCount = 0;
        Date nextReview = null;
        Date now = new Date();
        
        for (UserVocabularyLearning r : records) {
            int level = mapStreakToLevel(r.streakCorrect);
            distribution.put(level, distribution.get(level) + 1);
            
            if (r.nextReview != null) {
                if (r.nextReview.before(now) || r.nextReview.equals(now)) {
                    dueCount++;
                } else {
                    if (nextReview == null || r.nextReview.before(nextReview)) {
                        nextReview = r.nextReview;
                    }
                }
            }
        }
        
        return ResponseEntity.ok(new UserLearningStatsDto(
            (long) records.size(),
            totalPossible,
            dueCount,
            nextReview,
            distribution
        ));
    }

    private int mapStreakToLevel(Integer streak) {
        if (streak == null || streak == 0) return 1;
        if (streak <= 2) return 2;
        if (streak <= 4) return 3;
        if (streak <= 7) return 4;
        if (streak <= 10) return 5;
        return 6;
    }
}
