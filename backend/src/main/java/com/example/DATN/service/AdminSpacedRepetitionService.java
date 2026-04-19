package com.example.DATN.service;

import com.example.DATN.dto.AdminSpacedConfigDto;
import com.example.DATN.dto.AdminSpacedConfigUpdateRequest;
import com.example.DATN.dto.AdminSpacedOverviewResponse;
import com.example.DATN.dto.AdminSpacedResetCandidateDto;
import com.example.DATN.entity.SpacedConfig;
import com.example.DATN.entity.UserVocabularyLearning;
import com.example.DATN.repository.ReviewHistoryRepository;
import com.example.DATN.repository.SpacedConfigRepository;
import com.example.DATN.repository.UserRepository;
import com.example.DATN.repository.UserVocabularyLearningRepository;
import com.example.DATN.repository.ResetCandidateProjection;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminSpacedRepetitionService {
    private final ReviewHistoryRepository reviewHistoryRepository;
    private final UserVocabularyLearningRepository userVocabularyLearningRepository;
    private final SpacedConfigRepository spacedConfigRepository;
    private final UserRepository userRepository;

    public AdminSpacedRepetitionService(
            ReviewHistoryRepository reviewHistoryRepository,
            UserVocabularyLearningRepository userVocabularyLearningRepository,
            SpacedConfigRepository spacedConfigRepository,
            UserRepository userRepository
    ) {
        this.reviewHistoryRepository = reviewHistoryRepository;
        this.userVocabularyLearningRepository = userVocabularyLearningRepository;
        this.spacedConfigRepository = spacedConfigRepository;
        this.userRepository = userRepository;
    }

    public AdminSpacedOverviewResponse getOverview() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfToday = today.atStartOfDay();
        LocalDateTime endOfToday = startOfToday.plusDays(1);

        long dailyReviews = reviewHistoryRepository.countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(startOfToday, endOfToday);
        long wordsInReview = userVocabularyLearningRepository.count();
        long scheduledReviews = userVocabularyLearningRepository.countByNextReviewLessThanEqual(new java.util.Date());
        long masteredWords = userVocabularyLearningRepository.countByStreakCorrectGreaterThanEqual(5L);

        SpacedConfig config = getOrCreateConfig();

        List<AdminSpacedResetCandidateDto> candidates = userVocabularyLearningRepository
                .findResetCandidates(PageRequest.of(0, 12))
                .stream()
                .filter(this::isResetCandidate)
                .map(this::toResetCandidate)
                .toList();

        return new AdminSpacedOverviewResponse(
                new AdminSpacedOverviewResponse.SpacedStats(
                        dailyReviews,
                        wordsInReview,
                        scheduledReviews,
                        masteredWords
                ),
                toConfigDto(config),
                candidates
        );
    }

    public AdminSpacedConfigDto updateConfig(AdminSpacedConfigUpdateRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Config payload is required");
        }

        SpacedConfig config = getOrCreateConfig();

        if (request.beta0() != null) {
            config.beta0 = request.beta0();
        }
        if (request.beta1() != null) {
            config.beta1 = request.beta1();
        }
        if (request.beta2() != null) {
            config.beta2 = request.beta2();
        }
        if (request.beta3() != null) {
            config.beta3 = request.beta3();
        }
        if (request.k() != null) {
            config.k = request.k();
        }
        if (request.maxInterval() != null) {
            config.maxInterval = request.maxInterval();
        }

        validateConfig(config);

        SpacedConfig saved = spacedConfigRepository.save(config);
        return toConfigDto(saved);
    }

    public void resetUserLearningData(Long userId) {
        userRepository.findActiveById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        List<UserVocabularyLearning> rows = userVocabularyLearningRepository.findByUser_Id(userId);
        Date now = Date.from(LocalDateTime.now().atZone(ZoneId.systemDefault()).toInstant());

        rows.forEach(row -> {
            row.streakCorrect = 0;
            row.totalErrors = 0;
            row.totalAttempts = 0;
            row.difficulty = row.baseDifficulty != null ? row.baseDifficulty : 2.5;
            row.lastReview = null;
            row.nextReview = now;
        });

        userVocabularyLearningRepository.saveAll(rows);
    }

    private boolean isResetCandidate(ResetCandidateProjection row) {
        long attempts = row.getTotalAttempts() == null ? 0 : row.getTotalAttempts();
        long errors = row.getTotalErrors() == null ? 0 : row.getTotalErrors();
        long tracked = row.getWordsTracked() == null ? 0 : row.getWordsTracked();

        if (tracked < 20) {
            return false;
        }
        if (attempts == 0) {
            return false;
        }

        double errorRate = (errors * 1.0) / attempts;
        return errorRate >= 0.45 || (row.getAvgDifficulty() != null && row.getAvgDifficulty() >= 3.8);
    }

    private AdminSpacedResetCandidateDto toResetCandidate(ResetCandidateProjection row) {
        long attempts = row.getTotalAttempts() == null ? 0 : row.getTotalAttempts();
        long errors = row.getTotalErrors() == null ? 0 : row.getTotalErrors();
        double errorRate = attempts == 0 ? 0 : (errors * 100.0) / attempts;

        String reason;
        if (row.getAvgDifficulty() != null && row.getAvgDifficulty() >= 3.8) {
            reason = "Độ khó trung bình cao bất thường (" + round1(row.getAvgDifficulty()) + ")";
        } else {
            reason = "Tỷ lệ sai cao " + round1(errorRate) + "% trên dữ liệu ôn tập";
        }

        return new AdminSpacedResetCandidateDto(
                row.getUserId(),
                defaultString(row.getEmail(), "(không có email)"),
                reason,
                row.getWordsTracked() == null ? 0 : row.getWordsTracked()
        );
    }

    private SpacedConfig getOrCreateConfig() {
        return spacedConfigRepository.findTopByOrderByIdAsc().orElseGet(() -> {
            SpacedConfig config = new SpacedConfig();
            config.beta0 = 2.5;
            config.beta1 = 1.0;
            config.beta2 = 0.5;
            config.beta3 = 0.8;
            config.k = 10;
            config.maxInterval = 30;
            return spacedConfigRepository.save(config);
        });
    }

    private void validateConfig(SpacedConfig config) {
        if (config.k == null || config.k < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "K phải lớn hơn hoặc bằng 1");
        }
        if (config.maxInterval == null || config.maxInterval < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "maxInterval phải lớn hơn hoặc bằng 1");
        }

        List<Double> betaValues = List.of(config.beta0, config.beta1, config.beta2, config.beta3);
        for (Double beta : betaValues) {
            if (beta == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Các hệ số beta không được để trống");
            }
            if (beta < 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Các hệ số beta phải >= 0");
            }
        }
    }

    private AdminSpacedConfigDto toConfigDto(SpacedConfig config) {
        Long id = config.id == null ? null : config.id.longValue();
        return new AdminSpacedConfigDto(
                id,
                config.beta0,
                config.beta1,
                config.beta2,
                config.beta3,
                config.k,
                config.maxInterval
        );
    }

    private String defaultString(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value;
    }

    private String round1(double value) {
        return String.format(Locale.US, "%.1f", value);
    }
}
