package com.example.DATN.service.admin;

import com.example.DATN.dto.admin.AdminTopicDto;
import com.example.DATN.dto.admin.UpsertTopicRequest;
import com.example.DATN.entity.Topic;
import com.example.DATN.repository.projections.TopicManagementProjection;
import com.example.DATN.repository.content.TopicRepository;

import jakarta.transaction.Transactional;

import com.example.DATN.repository.content.LessonRepository;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * Service xử lý các nghiệp vụ quản trị chủ đề.
 * Đảm nhiệm việc tính toán số lượng bài học, kiểm tra trùng lặp và quản lý trạng thái (Xóa mềm).
 */
@Service
public class AdminTopicService {
    private final TopicRepository topicRepository;
    private final LessonRepository lessonRepository;

    public AdminTopicService(TopicRepository topicRepository, LessonRepository lessonRepository) {
        this.topicRepository = topicRepository;
        this.lessonRepository = lessonRepository;
    }

    /**
     * Lấy toàn bộ danh sách chủ đề phục vụ trang quản lý.
     * Dữ liệu được lấy thông qua Projection để tối ưu hiệu năng tính toán số lượng bài học.
     */
    public List<AdminTopicDto> findAll() {
        return topicRepository.findTopicManagementRows().stream().map(this::toDto).toList();
    }

    /**
     * Tìm chi tiết chủ đề kèm theo số lượng bài học tương ứng.
     */
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

    /**
     * Tạo mới một chủ đề. 
     * Kiểm tra trùng tên (không phân biệt hoa thường) trước khi lưu.
     */
    public AdminTopicDto create(UpsertTopicRequest request) {
        String name = request == null || request.name() == null ? "" : request.name().trim();
        if (topicRepository.existsByNameIgnoreCase(name)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Tên/Nội dung này đã tồn tại, vui lòng chọn tên khác");
        }
        Topic topic = new Topic();
        apply(topic, request);
        Topic saved = topicRepository.save(topic);
        return findById(saved.id);
    }

    public AdminTopicDto update(Long id, UpsertTopicRequest request) {
        String name = request == null || request.name() == null ? "" : request.name().trim();
        if (topicRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Tên/Nội dung này đã tồn tại, vui lòng chọn tên khác");
        }
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found"));
        apply(topic, request);
        topicRepository.save(topic);
        return findById(id);
    }

    /**
     * Xóa chủ đề.
     * @param force Nếu là true, xóa vĩnh viễn khỏi DB. Nếu là false, thực hiện xóa mềm (đánh dấu deletedAt).
     */
    public void delete(Long id, boolean force) {
        if (force) {
            topicRepository.hardDelete(id);
        } else {
            Topic topic = topicRepository.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Topic not found"));
            topic.status = false; // Đánh dấu tạm dừng hoạt động
            topic.deletedAt = new Date(); // Ghi nhận thời điểm xóa mềm
            topicRepository.save(topic);
        }
    }

    /**
     * Chuyển đổi dữ liệu từ Request DTO sang Entity.
     * Thực hiện kiểm tra các trường thông tin bắt buộc.
     */
    private void apply(Topic topic, UpsertTopicRequest request) {
        String name = request == null ? "" : defaultString(request.name(), "").trim();
        if (name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Vui lòng nhập đầy đủ các trường thông tin bắt buộc");
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
