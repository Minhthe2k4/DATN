package com.example.DATN.service;

import com.example.DATN.dto.AdminTopicDto;
import com.example.DATN.dto.UpsertTopicRequest;
import com.example.DATN.entity.Topic;
import com.example.DATN.repository.TopicManagementProjection;
import com.example.DATN.repository.TopicRepository;

import jakarta.transaction.Transactional;

import com.example.DATN.repository.LessonRepository;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminTopicService {
    private final TopicRepository topicRepository;
    private final LessonRepository lessonRepository;

    public AdminTopicService(TopicRepository topicRepository, LessonRepository lessonRepository) {
        this.topicRepository = topicRepository;
        this.lessonRepository = lessonRepository;
    }

    public List<AdminTopicDto> findAll() {
        return topicRepository.findTopicManagementRows().stream().map(this::toDto).toList();
    }

    public AdminTopicDto findById(Long id) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found"));

        return new AdminTopicDto(
                topic.id,
                defaultString(topic.name, ""),
                defaultString(topic.description, ""),
                lessonRepository.countByTopicId(topic.id),
                0,
                toStatusLabel(topic.status),
                topic.topicImage,
                topic.createdAt,
                topic.updatedAt,
                topic.deletedAt);
    }

    public AdminTopicDto create(UpsertTopicRequest request) {
        String name = request == null || request.name() == null ? "" : request.name().trim();
        if (topicRepository.existsByNameIgnoreCase(name)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên chủ đề đã tồn tại. Vui lòng chọn tên khác.");
        }
        Topic topic = new Topic();
        apply(topic, request);
        Topic saved = topicRepository.save(topic);
        return findById(saved.id);
    }

    public AdminTopicDto update(Long id, UpsertTopicRequest request) {
        String name = request == null || request.name() == null ? "" : request.name().trim();
        if (topicRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên chủ đề đã tồn tại. Vui lòng chọn tên khác.");
        }
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found"));
        apply(topic, request);
        topicRepository.save(topic);
        return findById(id);
    }

    public void delete(Long id, boolean force) {
        if (force) {
            topicRepository.hardDelete(id);
        } else {
            Topic topic = topicRepository.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found"));
            topic.status = false; // Soft delete
            topic.deletedAt = new Date();
            topicRepository.save(topic);
        }
    }

    private void apply(Topic topic, UpsertTopicRequest request) {
        String name = request == null ? "" : defaultString(request.name(), "").trim();
        if (name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Topic name is required");
        }
        topic.name = name;
        topic.description = request == null ? "" : defaultString(request.description(), "").trim();
        topic.status = toStatusValue(request == null ? null : request.status());
        topic.topicImage = request == null ? null : request.topicImage();
    }

    private AdminTopicDto toDto(TopicManagementProjection row) {
        return new AdminTopicDto(
                row.getId(),
                defaultString(row.getName(), ""),
                defaultString(row.getDescription(), ""),
                safeLong(row.getLessonCount()),
                safeLong(row.getWordCount()),
                toStatusLabel(row.getStatus()),
                row.getTopicImage(),
                row.getCreatedAt(),
                row.getUpdatedAt(),
                null); // deletedAt is usually NULL for management rows due to @SQLRestriction
    }

    private String toStatusLabel(Boolean status) {
        return Boolean.FALSE.equals(status) ? "Tạm dừng" : "Hoạt động";
    }

    private Boolean toStatusValue(String status) {
        String normalized = defaultString(status, "Hoạt động").trim().toLowerCase(Locale.ROOT);
        return !(normalized.equals("tạm dừng") || normalized.equals("tam dung") || normalized.equals("paused"));
    }

    private long safeLong(Long value) {
        return value == null ? 0 : value;
    }

    private String defaultString(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value;
    }

    public List<TopicManagementProjection> getDeletedTopics() {
        return topicRepository.findDeletedRows();
    }

    @Transactional
    public void restore(Long id) {
        topicRepository.restore(id);
    }
}
