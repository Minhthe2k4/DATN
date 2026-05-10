package com.example.DATN.service.admin;

import com.example.DATN.dto.admin.AdminUserDto;
import com.example.DATN.dto.admin.AdminUserLeaderDto;
import com.example.DATN.dto.admin.UpdateAdminUserRequest;
import com.example.DATN.entity.User;
import com.example.DATN.entity.UserProfile;
import com.example.DATN.repository.user.UserProfileRepository;
import com.example.DATN.repository.user.UserRepository;
import com.example.DATN.repository.user.UserStatsRepository;

import jakarta.transaction.Transactional;

import com.example.DATN.repository.projections.UserManagementProjection;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminUserService {
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final UserStatsRepository userStatsRepository;

    public AdminUserService(UserRepository userRepository, UserProfileRepository userProfileRepository,
            UserStatsRepository userStatsRepository) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.userStatsRepository = userStatsRepository;
    }

    public List<AdminUserDto> findAll() {
        return userRepository.findUserManagementRows(new Date()).stream().map(this::toDto).toList();
    }

    public AdminUserDto findById(Long id) {
        UserManagementProjection row = userRepository.findUserManagementRowById(id, new Date())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return toDto(row);
    }

    public AdminUserDto update(Long id, UpdateAdminUserRequest request) {
        User user = userRepository.findActiveById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        String username = normalizeRequired(request == null ? null : request.username(), "Username is required");
        String email = normalizeRequired(request == null ? null : request.email(), "Email is required");
        String role = normalizeRole(request == null ? null : request.role());

        user.username = username;
        user.email = email;
        user.role = role;
        user.phoneNumber = defaultString(request == null ? null : request.phoneNumber(), "").trim();

        if (request != null && request.password() != null && !request.password().isBlank()) {
            user.password = request.password();
        }

        userRepository.save(user);

        String fullName = defaultString(request == null ? null : request.fullName(), "").trim();
        String avatar = defaultString(request == null ? null : request.avatar(), "").trim();
        UserProfile profile = userProfileRepository.findFirstByUser_Id(id).orElseGet(UserProfile::new);
        profile.user = user;
        profile.fullName = fullName;
        if (!avatar.isEmpty() || profile.avatar == null) {
            profile.avatar = avatar;
        }
        userProfileRepository.save(profile);

        return findById(id);
    }

    public AdminUserDto updateActivation(Long id, Boolean active) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.deletedAt != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot update activation for a deleted user");
        }

        user.isActive = Boolean.TRUE.equals(active);
        userRepository.save(user);
        return findById(id);
    }

    public void delete(Long id, boolean force) {
        if (force) {
            userRepository.hardDelete(id);
        } else {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
            user.isActive = false;
            user.deletedAt = new Date();
            userRepository.save(user);
        }
    }

    public List<AdminUserLeaderDto> getLeaders() {
        return userStatsRepository
                .findTopUsers(PageRequest.of(0, 6))
                .stream()
                .map(row -> {
                    int learnedWords = row.getLearnedWords() == null ? 0 : row.getLearnedWords().intValue();
                    int completion = calculateCompletion(learnedWords,
                            row.getTotalWords() == null ? 0 : row.getTotalWords().intValue());
                    return new AdminUserLeaderDto(
                            "USR-" + defaultString(row.getUsername(), "unknown"),
                            defaultString(row.getUsername(), "Người dùng"),
                            row.getStreakDays() == null ? 0 : row.getStreakDays().intValue(),
                            learnedWords,
                            completion);
                })
                .toList();
    }

    private int calculateCompletion(int learnedWords, int totalWords) {
        if (totalWords <= 0) {
            return 0;
        }
        double percent = (learnedWords * 100.0) / totalWords;
        return Math.max(0, Math.min((int) Math.round(percent), 100));
    }

    private AdminUserDto toDto(UserManagementProjection row) {
        boolean isActive = Boolean.TRUE.equals(row.getIsActive());
        boolean premium = row.getIsPremium() != null && row.getIsPremium() != 0;
        return new AdminUserDto(
                row.getId(),
                defaultString(row.getUsername(), ""),
                defaultString(row.getEmail(), ""),
                defaultString(row.getFullName(), ""),
                normalizeRole(row.getRole()),
                defaultString(row.getAvatar(), ""),
                defaultString(row.getPhoneNumber(), ""),
                isActive,
                row.getCreatedAt(),
                row.getUpdatedAt(),
                row.getDeletedAt(),
                premium,
                row.getPremiumUntil(),
                isActive ? "Hoạt động" : "Bị khóa");
    }

    // private int safeInt(Integer value) {
    // return value == null ? 0 : value;
    // }

    private String normalizeRole(String role) {
        String normalized = defaultString(role, "USER").trim().toUpperCase(Locale.ROOT);
        return normalized.equals("ADMIN") ? "ADMIN" : "USER";
    }

    private String normalizeRequired(String value, String error) {
        String normalized = defaultString(value, "").trim();
        if (normalized.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, error);
        }
        return normalized;
    }

    private String defaultString(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value;
    }

    public List<UserManagementProjection> getDeletedUsers() {
        return userRepository.findDeletedRows(new java.util.Date());
    }

    @Transactional
    public void restore(Long id) {
        userRepository.restore(id);
    }
}
