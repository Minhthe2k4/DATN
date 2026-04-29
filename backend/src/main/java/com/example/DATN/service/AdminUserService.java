package com.example.DATN.service;

import com.example.DATN.dto.AdminDashboardOverviewResponse;
import com.example.DATN.dto.AdminUserDto;
import com.example.DATN.dto.UpdateAdminUserRequest;
import com.example.DATN.entity.User;
import com.example.DATN.entity.UserProfile;
import com.example.DATN.repository.UserProfileRepository;
import com.example.DATN.repository.UserRepository;

import jakarta.transaction.Transactional;

import com.example.DATN.repository.UserManagementProjection;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminUserService {
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final AdminDashboardService adminDashboardService;

    public AdminUserService(UserRepository userRepository, UserProfileRepository userProfileRepository,
            AdminDashboardService adminDashboardService) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.adminDashboardService = adminDashboardService;
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
        user.avatar = defaultString(request == null ? null : request.avatar(), "").trim();
        user.phoneNumber = defaultString(request == null ? null : request.phoneNumber(), "").trim();

        if (request != null && request.password() != null && !request.password().isBlank()) {
            user.password = request.password();
        }

        userRepository.save(user);

        String fullName = defaultString(request == null ? null : request.fullName(), "").trim();
        UserProfile profile = userProfileRepository.findByUserId(id).orElseGet(UserProfile::new);
        profile.user = user;
        profile.fullName = fullName;
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

    public List<AdminDashboardOverviewResponse.UserActivityLeaderItem> getLeaders() {
        return adminDashboardService.getOverview().userActivityLeaders();
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

    private int safeInt(Integer value) {
        return value == null ? 0 : value;
    }

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
