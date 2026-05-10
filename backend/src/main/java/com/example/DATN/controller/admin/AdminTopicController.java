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

@RestController
@RequestMapping("/api/admin/topics")
public class AdminTopicController {
    private final AdminTopicService adminTopicService;

    public AdminTopicController(AdminTopicService adminTopicService) {
        this.adminTopicService = adminTopicService;
    }

    @GetMapping
    public List<AdminTopicDto> findAll() {
        return adminTopicService.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AdminTopicDto create(@RequestBody UpsertTopicRequest request) {
        return adminTopicService.create(request);
    }

    @PutMapping("/{id}")
    public AdminTopicDto update(@PathVariable Long id, @RequestBody UpsertTopicRequest request) {
        return adminTopicService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Long id,
            @org.springframework.web.bind.annotation.RequestParam(required = false, defaultValue = "false") boolean force) {
        adminTopicService.delete(id, force);
    }

    @GetMapping("/deleted")
    public List<TopicManagementProjection> getDeletedTopics() {
        return adminTopicService.getDeletedTopics();
    }

    @GetMapping("/{id}")
    public AdminTopicDto findById(@PathVariable Long id) {
        return adminTopicService.findById(id);
    }

    @PatchMapping("/{id}/restore")
    public void restore(@PathVariable Long id) {
        adminTopicService.restore(id);
    }
}
