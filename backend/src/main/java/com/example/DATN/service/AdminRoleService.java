package com.example.DATN.service;

import com.example.DATN.dto.AdminRoleOverviewResponse;
import com.example.DATN.entity.User;
import com.example.DATN.repository.UserRepository;
import com.example.DATN.repository.UserManagementProjection;
import java.util.List;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminRoleService {
    private final UserRepository userRepository;

    public AdminRoleService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public AdminRoleOverviewResponse getOverview() {
        List<UserManagementProjection> rows = userRepository.findUserManagementRows(new java.util.Date());

        long adminCount = rows.stream().filter(item -> normalizeRole(item.getRole()).equals("ADMIN")).count();
        long userCount = rows.stream().filter(item -> normalizeRole(item.getRole()).equals("USER")).count();

        List<AdminRoleOverviewResponse.RoleUserItem> users = rows.stream()
                .map(row -> new AdminRoleOverviewResponse.RoleUserItem(
                        row.getId(),
                        defaultString(row.getUsername(), ""),
                        defaultString(row.getEmail(), ""),
                        normalizeRole(row.getRole()),
                        Boolean.TRUE.equals(row.getIsActive())
                ))
                .toList();

        return new AdminRoleOverviewResponse(
                List.of(
                        new AdminRoleOverviewResponse.RoleStat("ADMIN", adminCount),
                        new AdminRoleOverviewResponse.RoleStat("USER", userCount)
                ),
                users
        );
    }

    public AdminRoleOverviewResponse.RoleUserItem updateRole(Long userId, String role) {
        User user = userRepository.findActiveById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        user.role = normalizeRole(role);
        userRepository.save(user);
        return new AdminRoleOverviewResponse.RoleUserItem(
                user.id == null ? null : user.id.longValue(),
                defaultString(user.username, ""),
                defaultString(user.email, ""),
                normalizeRole(user.role),
                Boolean.TRUE.equals(user.isActive)
        );
    }

    private String normalizeRole(String role) {
        String normalized = defaultString(role, "USER").trim().toUpperCase(Locale.ROOT);
        return normalized.equals("ADMIN") ? "ADMIN" : "USER";
    }

    private String defaultString(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value;
    }
}
