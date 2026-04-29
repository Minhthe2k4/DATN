package com.example.DATN.service;

import com.example.DATN.dto.AdminLessonDto;
import com.example.DATN.dto.UpsertLessonRequest;
import com.example.DATN.entity.Lesson;
import com.example.DATN.entity.Topic;
import com.example.DATN.repository.LessonRepository;
import com.example.DATN.repository.TopicRepository;

import jakarta.transaction.Transactional;

import com.example.DATN.repository.LessonManagementProjection;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminLessonService {
    private final LessonRepository lessonRepository;
    private final TopicRepository topicRepository;

    public AdminLessonService(LessonRepository lessonRepository, TopicRepository topicRepository) {
        this.lessonRepository = lessonRepository;
        this.topicRepository = topicRepository;
    }

    public List<AdminLessonDto> findAll() {
        return lessonRepository.findLessonManagementRows().stream().map(this::toDto).toList();
    }

    public AdminLessonDto findById(Long id) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found"));

        return new AdminLessonDto(
                lesson.id,
                defaultString(lesson.name, ""),
                defaultString(lesson.description, ""),
                lesson.topic == null ? null : lesson.topic.id,
                normalizeDifficulty(lesson.difficulty),
                defaultString(lesson.status, "Đang mở"),
                lesson.lessonImage,
                lesson.isPremium,
                lesson.createdAt,
                lesson.updatedAt,
                lesson.deletedAt);
    }

    public AdminLessonDto create(UpsertLessonRequest request) {
        String name = request == null || request.name() == null ? "" : request.name().trim();
        if (lessonRepository.existsByNameIgnoreCase(name)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Tên bài học đã tồn tại. Vui lòng chọn tên khác.");
        }
        Lesson lesson = new Lesson();
        apply(lesson, request);
        Lesson saved = lessonRepository.save(lesson);
        return findById(saved.id);
    }

    public AdminLessonDto update(Long id, UpsertLessonRequest request) {
        String name = request == null || request.name() == null ? "" : request.name().trim();
        if (lessonRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Tên bài học đã tồn tại. Vui lòng chọn tên khác.");
        }
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found"));
        apply(lesson, request);
        lessonRepository.save(lesson);
        return findById(id);
    }

    public void delete(Long id, boolean force) {
        if (force) {
            lessonRepository.hardDelete(id);
        } else {
            Lesson lesson = lessonRepository.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found"));
            lesson.status = "Tạm dừng"; // Soft delete
            lesson.deletedAt = new Date();
            lessonRepository.save(lesson);
        }
    }

    private void apply(Lesson lesson, UpsertLessonRequest request) {
        String name = request == null ? "" : defaultString(request.name(), "").trim();
        if (name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lesson name is required");
        }
        if (request == null || request.topicId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lesson topic is required");
        }

        Topic topic = topicRepository.findById(request.topicId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Topic not found"));

        lesson.name = name;
        lesson.description = request == null ? "" : defaultString(request.description(), "").trim();
        lesson.topic = topic;
        lesson.difficulty = normalizeDifficulty(request == null ? null : request.difficulty());
        lesson.status = defaultString(request == null ? null : request.status(), "Đang mở");
        lesson.lessonImage = request == null ? null : request.lessonImage();
        lesson.isPremium = request != null && Boolean.TRUE.equals(request.isPremium());
    }

    private AdminLessonDto toDto(LessonManagementProjection row) {
        return new AdminLessonDto(
                row.getId(),
                defaultString(row.getName(), ""),
                defaultString(row.getDescription(), ""),
                row.getTopicId(),
                normalizeDifficulty(row.getDifficulty()),
                defaultString(row.getStatus(), "Đang mở"),
                row.getLessonImage(),
                row.getIsPremium(),
                row.getCreatedAt(),
                row.getUpdatedAt(),
                null); // deletedAt is usually NULL for management rows
    }

    private String normalizeDifficulty(String value) {
        String normalized = defaultString(value, "Trung bình").trim().toLowerCase(Locale.ROOT);
        return switch (normalized) {
            case "co ban", "cơ bản", "basic" -> "Cơ bản";
            case "nang cao", "nâng cao", "advanced" -> "Nâng cao";
            default -> "Trung bình";
        };
    }

    private String defaultString(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value;
    }

    public List<LessonManagementProjection> getDeletedLessons() {
        return lessonRepository.findDeletedRows();
    }

    @Transactional
    public void restore(Long id) {
        lessonRepository.restore(id);
    }
}
