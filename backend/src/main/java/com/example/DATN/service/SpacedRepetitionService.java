package com.example.DATN.service;

import com.example.DATN.entity.SpacedConfig;
import com.example.DATN.entity.User;
import com.example.DATN.entity.UserVocabularyCustom;
import com.example.DATN.entity.UserVocabularyLearning;
import com.example.DATN.entity.Vocabulary;
import com.example.DATN.entity.ReviewHistory;
import com.example.DATN.entity.ReviewSession;
import com.example.DATN.repository.SpacedConfigRepository;
import com.example.DATN.repository.UserVocabularyLearningRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;
import java.util.Optional;

/**
 * Service trung tâm xử lý thuật toán Spaced Repetition (SRS).
 * Sử dụng mô hình Half-Life Regression (HLR) kết hợp với Bayesian Smoothing
 * để cá nhân hóa lộ trình ôn tập dựa trên khả năng ghi nhớ của từng người dùng.
 */
@Service
public class SpacedRepetitionService {

    @Autowired
    private UserVocabularyLearningRepository userVocabularyLearningRepository;

    @Autowired
    private SpacedConfigRepository spacedConfigRepository;

    @Autowired
    private com.example.DATN.repository.ReviewHistoryRepository reviewHistoryRepository;

    @Autowired
    private com.example.DATN.repository.ReviewSessionRepository reviewSessionRepository;

    @Autowired
    private UserStatsService userStatsService;

    private static final double TARGET_RECALL_PROB = 0.9;
    private static final double Z_TARGET = Math.log(TARGET_RECALL_PROB / (1 - TARGET_RECALL_PROB)); // approx 2.197

    public void initializeLearning(User user, Vocabulary vocab) {
        initializeLearningInternal(user, vocab, null, vocab.level);
    }

    public void initializeLearning(User user, UserVocabularyCustom customVocab) {
        String levelStr = customVocab.level != null ? String.valueOf(customVocab.level) : null;
        initializeLearningInternal(user, null, customVocab, levelStr);
    }

    /**
     * 1. Khởi tạo việc học cho một từ vựng mới (UC_KhoiTaoHoc).
     * Thiết lập các tham số SRS ban đầu và lịch ôn tập đầu tiên là "Ngay bây giờ".
     */
    private void initializeLearningInternal(User user, Vocabulary vocab, UserVocabularyCustom customVocab,
            String level) {
        // Kiểm tra xem từ này đã được đưa vào lộ trình học chưa
        if (vocab != null && userVocabularyLearningRepository.existsByUser_IdAndVocabulary_Id(user.id, vocab.id)) {
            return;
        }
        if (customVocab != null
                && userVocabularyLearningRepository.existsByUser_IdAndCustomVocab_Id(user.id, customVocab.id)) {
            return;
        }

        UserVocabularyLearning learning = new UserVocabularyLearning();
        learning.user = user;
        learning.vocabulary = vocab;
        learning.customVocab = customVocab;

        // Gán độ khó ban đầu dựa trên trình độ của từ (A1, B1, C1...)
        double baseDiff = mapLevelToDifficulty(level);
        learning.baseDifficulty = baseDiff;
        learning.difficulty = baseDiff;
        learning.streakCorrect = 0;
        learning.totalAttempts = 0;
        learning.totalErrors = 0;

        // Lần đầu tiên học sẽ được lên lịch ngay lập tức
        learning.nextReview = new Date();

        userVocabularyLearningRepository.save(learning);
        userStatsService.syncStats(user.id);
    }

    /**
     * 2. Cập nhật tiến độ sau khi người dùng thực hiện một lượt ôn tập
     * (UC_CapNhatTienDo).
     * Áp dụng thuật toán HLR và Bayesian Smoothing để tính toán ngày ôn tập tiếp
     * theo.
     */
    public void updateProgress(Long userId, Long vocabId, boolean isCustom, boolean isCorrect, Long responseTimeMs) {
        // Tìm bản ghi học tập tương ứng
        List<UserVocabularyLearning> records = userVocabularyLearningRepository.findByUser_Id(userId);
        Optional<UserVocabularyLearning> recordOpt = records.stream()
                .filter(r -> {
                    if (isCustom) {
                        return r.customVocab != null && r.customVocab.id.equals(vocabId);
                    } else {
                        return r.vocabulary != null && r.vocabulary.id.equals(vocabId);
                    }
                })
                .findFirst();

        if (recordOpt.isEmpty()) {
            return;
        }

        UserVocabularyLearning row = recordOpt.get();
        SpacedConfig config = getOrCreateConfig();

        // BƯỚC 1: Cập nhật các chỉ số cơ bản (Tổng số lần làm, số lần sai, chuỗi đúng
        // liên tiếp)
        row.totalAttempts = (row.totalAttempts == null ? 0 : row.totalAttempts) + 1;
        if (!isCorrect) {
            row.totalErrors = (row.totalErrors == null ? 0 : row.totalErrors) + 1;
            row.streakCorrect = 0; // Sai thì chuỗi đúng về 0
        } else {
            row.streakCorrect = (row.streakCorrect == null ? 0 : row.streakCorrect) + 1;
        }

        // BƯỚC 2: Thuật toán Bayesian Smoothing để làm mượt độ khó (Difficulty).
        // Tránh việc 1 lần lỡ tay bấm sai làm từ vựng bị coi là "quá khó" ngay lập tức.
        double k = config.k != null ? config.k : 10.0;
        double baseDiff = row.baseDifficulty != null ? row.baseDifficulty : 2.0;
        row.difficulty = (baseDiff * k + row.totalErrors) / (k + row.totalAttempts);

        // BƯỚC 3: Mô hình Half-Life Regression (HLR) tính toán thời điểm ôn tập kế
        // tiếp.
        // Dựa trên: Chuỗi đúng (h), Độ khó (c) và các tham số cấu hình Beta.
        double h = row.streakCorrect;
        double c = row.difficulty;
        double beta0 = config.beta0 != null ? config.beta0 : 2.5;
        double beta1 = config.beta1 != null ? config.beta1 : 1.0;
        double beta2 = config.beta2 != null ? config.beta2 : 0.5;
        double beta3 = config.beta3 != null ? config.beta3 : 0.8;
        double beta4 = config.beta4 != null ? config.beta4 : 0.5;

        // BƯỚC 4: Tích hợp yếu tố Fluency (Tốc độ phản hồi).
        // Nếu trả lời đúng nhưng chậm (>15s), hệ thống coi là bạn chưa thuộc kỹ và sẽ
        // bắt ôn lại sớm hơn.
        double tMaxMs = 15000.0;
        double tMs = (responseTimeMs == null || responseTimeMs <= 0) ? 5000.0 : responseTimeMs;
        double normalizedT = Math.min(1.0, tMs / tMaxMs);

        // Công thức tính toán số ngày ôn tập tiếp theo (delayDays)
        double delayDays = (beta0 + beta1 * h - beta3 * c - beta4 * normalizedT - Z_TARGET) / beta2;

        // Đảm bảo khoảng cách ôn tập nằm trong giới hạn (Min: 0.1 ngày ~ 2.4 giờ, Max:
        // theo cấu hình)
        if (delayDays < 0.1)
            delayDays = 0.1;
        if (delayDays > (config.maxInterval != null ? config.maxInterval : 30)) {
            delayDays = config.maxInterval != null ? config.maxInterval : 30;
        }

        // Cập nhật ngày ôn tập tiếp theo vào Database
        row.lastReview = new Date();
        LocalDateTime next = LocalDateTime.now().plus((long) (delayDays * 24 * 60), ChronoUnit.MINUTES);
        row.nextReview = Date.from(next.atZone(ZoneId.systemDefault()).toInstant());

        userVocabularyLearningRepository.save(row);

        // BƯỚC 5: Ghi nhật ký chi tiết vào ReviewHistory để phục vụ báo cáo và phân
        // tích sau này.
        ReviewHistory history = new ReviewHistory();
        history.user = row.user;
        history.vocabulary = row.vocabulary;
        history.customVocab = row.customVocab;
        history.isCorrect = isCorrect;
        history.responseTime = (responseTimeMs != null) ? responseTimeMs.doubleValue() : 0.0;
        history.createdAt = new Date();
        reviewHistoryRepository.save(history);
    }

    /**
     * Lưu phiên học tập (UC_LuuPhienHoc).
     * Tổng kết buổi học (số câu làm, số câu đúng) để Admin đánh giá hiệu quả học
     * tập chung.
     */
    public void createReviewSession(Long userId, int total, int correct) {
        ReviewSession session = new ReviewSession();
        User user = new User();
        user.id = userId;
        session.user = user;
        session.totalQuestions = total;
        session.correctAnswers = correct;
        session.accuracy = total > 0 ? (correct * 100.0) / total : 0.0;
        session.createdAt = new Date();
        reviewSessionRepository.save(session);

        userStatsService.updateStreak(userId);
        userStatsService.syncStats(userId);
        userStatsService.recalculateRanks();
    }

    /**
     * Hàm chuyển đổi trình độ từ vựng (A1-C2) thành con số.
     * Giúp thuật toán có thể tính toán độ khó ban đầu cho từ vựng.
     */
    private double mapLevelToDifficulty(String level) {
        if (level == null || level.isBlank())
            return 2.0;
        String clean = level.trim().toUpperCase();
        return switch (clean) {
            case "A1", "1" -> 1.0;
            case "A2", "2" -> 1.5;
            case "B1", "3" -> 2.0;
            case "B2", "4" -> 2.5;
            case "C1", "5" -> 3.0;
            case "C2", "6" -> 3.5;
            default -> 2.0;
        };
    }

    private SpacedConfig getOrCreateConfig() {
        return spacedConfigRepository.findTopByOrderByIdAsc().orElseGet(() -> {
            SpacedConfig config = new SpacedConfig();
            config.beta0 = 2.5;
            config.beta1 = 1.0;
            config.beta2 = 0.5;
            config.beta3 = 0.8;
            config.beta4 = 0.5;
            config.k = 10;
            config.maxInterval = 30;
            return spacedConfigRepository.save(config);
        });
    }
}
