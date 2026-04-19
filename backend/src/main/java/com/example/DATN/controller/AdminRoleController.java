package com.example.DATN.controller;

import com.example.DATN.dto.AdminRoleOverviewResponse;
import com.example.DATN.service.AdminRoleService;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/roles")
public class AdminRoleController {
    private final AdminRoleService adminRoleService;

    public AdminRoleController(AdminRoleService adminRoleService) {
        this.adminRoleService = adminRoleService;
    }

    @GetMapping("/overview")
    public AdminRoleOverviewResponse getOverview() {
        return adminRoleService.getOverview();
    }

    @PatchMapping("/users/{userId}")
    public AdminRoleOverviewResponse.RoleUserItem updateRole(
            @PathVariable Long userId,
            @RequestBody Map<String, String> payload
    ) {
        return adminRoleService.updateRole(userId, payload == null ? null : payload.get("role"));
    }
}
