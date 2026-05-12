package com.example.DATN.controller.admin;

import com.example.DATN.dto.admin.AdminUserDto;
import com.example.DATN.dto.admin.AdminUserLeaderDto;
import com.example.DATN.dto.admin.UpdateAdminUserRequest;
import com.example.DATN.dto.admin.UpdateUserActivationRequest;
import com.example.DATN.repository.projections.UserManagementProjection;
import com.example.DATN.service.admin.AdminUserService;
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

// Controller quản lý toàn bộ người dùng trong hệ thống dành cho Admin.
@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {
    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    // Lấy danh sách toàn bộ người dùng.
    @GetMapping
    public List<AdminUserDto> findAll() {
        return adminUserService.findAll();
    }

    // Lấy danh sách người dùng dẫn đầu (Leaders) trong hệ thống.
    @GetMapping("/leaders")
    public List<AdminUserLeaderDto> getLeaders() {
        return adminUserService.getLeaders();
    }

    // Cập nhật thông tin chi tiết người dùng.
    @PutMapping("/{id}")
    public AdminUserDto update(@PathVariable Long id, @RequestBody UpdateAdminUserRequest request) {
        return adminUserService.update(id, request);
    }

    // Kích hoạt hoặc vô hiệu hóa (Khóa) tài khoản người dùng.
    @PatchMapping("/{id}/activation")
    public AdminUserDto updateActivation(@PathVariable Long id, @RequestBody UpdateUserActivationRequest request) {
        return adminUserService.updateActivation(id, request == null ? null : request.active());
    }

    // Xóa tài khoản người dùng (Xóa mềm hoặc xóa vĩnh viễn).
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Long id,
            @org.springframework.web.bind.annotation.RequestParam(required = false, defaultValue = "false") boolean force) {
        adminUserService.delete(id, force);
    }

    @GetMapping("/deleted")
    public List<UserManagementProjection> getDeletedUsers() {
        return adminUserService.getDeletedUsers();
    }

    @GetMapping("/{id}")
    public AdminUserDto findById(@PathVariable Long id) {
        return adminUserService.findById(id);
    }

    @PatchMapping("/{id}/restore")
    public void restore(@PathVariable Long id) {
        adminUserService.restore(id);
    }
}
