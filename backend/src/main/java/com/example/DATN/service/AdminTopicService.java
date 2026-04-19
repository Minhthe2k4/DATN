package com.example.DATN.service;

import com.example.DATN.dto.AdminTopicDto;
import com.example.DATN.dto.UpsertTopicRequest;
import com.example.DATN.entity.Topic;
import com.example.DATN.repository.TopicManagementProjection;
import com.example.DATN.repository.TopicRepository;
import java.util.List;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminTopicService {
    private final TopicRepository topicRepository;

    public AdminTopicService(TopicRepository topicRepository) {
        this.topicRepository = topicRepository;
    }

    public List<AdminTopicDto> findAll() {
        return topicRepository.findTopicManagementRows().stream().map(this::toDto).toList();
    }

    public AdminTopicDto findById(Long id) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found"));

        return new AdminTopicDto(
            toLong(Math.toIntExact(topic.id)),
                defaultString(topic.name, ""),
                defaultString(topic.description, ""),
                normalizeDifficulty(topic.level),
            0,
                0,
                toStatusLabel(topic.status)
        );
    }

    public AdminTopicDto create(UpsertTopicRequest request) {
        Topic topic = new Topic();
        apply(topic, request);
        Topic saved = topicRepository.save(topic);
        return findById(toLong(Math.toIntExact(saved.id)));
    }

    public AdminTopicDto update(Long id, UpsertTopicRequest request) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found"));
        apply(topic, request);
        topicRepository.save(topic);
        return findById(id);
    }

    public void delete(Long id) {
        if (!topicRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found");
        }
        topicRepository.deleteById(id);
    }

    private void apply(Topic topic, UpsertTopicRequest request) {
        String name = request == null ? "" : defaultString(request.name(), "").trim();
        if (name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Topic name is required");
        }
        topic.name = name;
        topic.description = request == null ? "" : defaultString(request.description(), "").trim();
        topic.level = normalizeDifficulty(request == null ? null : request.defaultDifficulty());
        topic.status = toStatusValue(request == null ? null : request.status());
    }

    private AdminTopicDto toDto(TopicManagementProjection row) {
        return new AdminTopicDto(
                row.getId(),
                defaultString(row.getName(), ""),
                defaultString(row.getDescription(), ""),
                normalizeDifficulty(row.getLevel()),
                safeLong(row.getLessonCount()),
                safeLong(row.getWordCount()),
                toStatusLabel(row.getStatus())
        );
    }

    private String normalizeDifficulty(String value) {
        String normalized = defaultString(value, "Trung bình").trim().toLowerCase(Locale.ROOT);
        return switch (normalized) {
            case "co ban", "cơ bản", "basic" -> "Cơ bản";
            case "nang cao", "nâng cao", "advanced" -> "Nâng cao";
            default -> "Trung bình";
        };
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

    private Long toLong(Integer value) {
        return value == null ? null : value.longValue();
    }
}
