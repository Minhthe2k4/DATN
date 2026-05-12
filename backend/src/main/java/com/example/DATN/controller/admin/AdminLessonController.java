package com.example.DATN.controller.admin;

import com.example.DATN.dto.admin.AdminLessonDto;
import com.example.DATN.dto.admin.UpsertLessonRequest;
import com.example.DATN.repository.projections.LessonManagementProjection;
import com.example.DATN.service.admin.AdminLessonService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

// Controller xử lý các yêu cầu quản trị liên quan đến bài học (Lesson).
// Quản lý vòng đời bài học bao gồm: Tạo mới, cập nhật thông tin, gán vào chủ đề, và gỡ bỏ.
@RestController
@RequestMapping("/api/admin/lessons")
public class AdminLessonController {
    private final AdminLessonService adminLessonService;

    public AdminLessonController(AdminLessonService adminLessonService) {
        this.adminLessonService = adminLessonService;
    }

    // Lấy danh sách toàn bộ bài học có trên hệ thống (phục vụ bảng quản lý).
    @GetMapping
    public List<AdminLessonDto> findAll() {
        return adminLessonService.findAll();
    }

    // Tạo mới một bài học và gán vào một chủ đề cụ thể.
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AdminLessonDto create(@RequestBody UpsertLessonRequest request) {
        return adminLessonService.create(request);
    }

    // Cập nhật thông tin bài học (Tên, mô tả, độ khó, trạng thái Premium).
    @PutMapping("/{id}")
    public AdminLessonDto update(@PathVariable Long id, @RequestBody UpsertLessonRequest request) {
        return adminLessonService.update(id, request);
    }

    // Xóa bài học (Xóa mềm hoặc xóa vĩnh viễn tùy thuộc vào tham số force).
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Long id,
            @org.springframework.web.bind.annotation.RequestParam(required = false, defaultValue = "false") boolean force) {
        adminLessonService.delete(id, force);
    }

    // Xem danh sách các bài học đã bị xóa mềm (phục vụ Thùng rác).
    @GetMapping("/deleted")
    public List<LessonManagementProjection> getDeletedLessons() {
        return adminLessonService.getDeletedLessons();
    }

    // Lấy chi tiết thông tin một bài học theo ID.
    @GetMapping("/{id}")
    public AdminLessonDto findById(@PathVariable Long id) {
        return adminLessonService.findById(id);
    }

    // Khôi phục bài học đã bị xóa mềm.
    @PatchMapping("/{id}/restore")
    public void restore(@PathVariable Long id) {
        adminLessonService.restore(id);
    }
}
