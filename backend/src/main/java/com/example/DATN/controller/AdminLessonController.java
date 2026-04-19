package com.example.DATN.controller;

import com.example.DATN.dto.AdminLessonDto;
import com.example.DATN.dto.UpsertLessonRequest;
import com.example.DATN.service.AdminLessonService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/lessons")
public class AdminLessonController {
    private final AdminLessonService adminLessonService;

    public AdminLessonController(AdminLessonService adminLessonService) {
        this.adminLessonService = adminLessonService;
    }

    @GetMapping
    public List<AdminLessonDto> findAll() {
        return adminLessonService.findAll();
    }

    @GetMapping("/{id}")
    public AdminLessonDto findById(@PathVariable Long id) {
        return adminLessonService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AdminLessonDto create(@RequestBody UpsertLessonRequest request) {
        return adminLessonService.create(request);
    }

    @PutMapping("/{id}")
    public AdminLessonDto update(@PathVariable Long id, @RequestBody UpsertLessonRequest request) {
        return adminLessonService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        adminLessonService.delete(id);
    }
}
