package com.example.DATN.controller;

import com.example.DATN.dto.AdminDashboardOverviewResponse;
import com.example.DATN.dto.AdminUserDto;
import com.example.DATN.dto.UpdateAdminUserRequest;
import com.example.DATN.dto.UpdateUserActivationRequest;
import com.example.DATN.service.AdminUserService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {
    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @GetMapping
    public List<AdminUserDto> findAll() {
        return adminUserService.findAll();
    }

    @GetMapping("/leaders")
    public List<AdminDashboardOverviewResponse.UserActivityLeaderItem> getLeaders() {
        return adminUserService.getLeaders();
    }

    @GetMapping("/{id}")
    public AdminUserDto findById(@PathVariable Long id) {
        return adminUserService.findById(id);
    }

    @PutMapping("/{id}")
    public AdminUserDto update(@PathVariable Long id, @RequestBody UpdateAdminUserRequest request) {
        return adminUserService.update(id, request);
    }

    @PatchMapping("/{id}/activation")
    public AdminUserDto updateActivation(@PathVariable Long id, @RequestBody UpdateUserActivationRequest request) {
        return adminUserService.updateActivation(id, request == null ? null : request.active());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void softDelete(@PathVariable Long id) {
        adminUserService.softDelete(id);
    }
}
