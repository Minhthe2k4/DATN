package com.example.DATN.controller.admin;

import com.example.DATN.dto.admin.AdminTopicDto;
import com.example.DATN.dto.admin.UpsertTopicRequest;
import com.example.DATN.repository.projections.TopicManagementProjection;
import com.example.DATN.service.admin.AdminTopicService;
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

/**
 * Controller xử lý các tác vụ quản trị chủ đề học tập.
 * Hỗ trợ các thao tác CRUD: Xem danh sách, thêm mới, cập nhật, xóa mềm và khôi phục chủ đề.
 */
@RestController
@RequestMapping("/api/admin/topics")
public class AdminTopicController {
    private final AdminTopicService adminTopicService;

    public AdminTopicController(AdminTopicService adminTopicService) {
        this.adminTopicService = adminTopicService;
    }

    /**
     * Lấy danh sách toàn bộ chủ đề kèm theo thông tin tổng hợp (số lượng bài học).
     */
    @GetMapping
    public List<AdminTopicDto> findAll() {
        return adminTopicService.findAll();
    }

    /**
     * Tạo mới một chủ đề học tập.
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AdminTopicDto create(@RequestBody UpsertTopicRequest request) {
        return adminTopicService.create(request);
    }

    /**
     * Cập nhật thông tin chủ đề hiện có.
     */
    @PutMapping("/{id}")
    public AdminTopicDto update(@PathVariable Long id, @RequestBody UpsertTopicRequest request) {
        return adminTopicService.update(id, request);
    }

    /**
     * Xóa một chủ đề.
     * @param force Nếu là true, thực hiện xóa cứng khỏi database. Nếu false, thực hiện xóa mềm.
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Long id,
            @org.springframework.web.bind.annotation.RequestParam(required = false, defaultValue = "false") boolean force) {
        adminTopicService.delete(id, force);
    }

    /**
     * Lấy danh sách các chủ đề đã bị xóa (phục vụ chức năng thùng rác).
     */
    @GetMapping("/deleted")
    public List<TopicManagementProjection> getDeletedTopics() {
        return adminTopicService.getDeletedTopics();
    }

    /**
     * Lấy thông tin chi tiết của một chủ đề theo ID.
     */
    @GetMapping("/{id}")
    public AdminTopicDto findById(@PathVariable Long id) {
        return adminTopicService.findById(id);
    }

    /**
     * Khôi phục chủ đề đã bị xóa mềm.
     */
    @PatchMapping("/{id}/restore")
    public void restore(@PathVariable Long id) {
        adminTopicService.restore(id);
    }
}
