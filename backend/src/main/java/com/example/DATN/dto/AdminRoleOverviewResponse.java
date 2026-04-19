package com.example.DATN.dto;

import java.util.List;

public record AdminRoleOverviewResponse(
        List<RoleStat> stats,
        List<RoleUserItem> users
) {
    public record RoleStat(
            String role,
            long count
    ) {
    }

    public record RoleUserItem(
            Long id,
            String username,
            String email,
            String role,
            boolean active
    ) {
    }
}
