package com.example.DATN.service.admin;

import com.example.DATN.dto.admin.AdminLessonDto;
import com.example.DATN.dto.admin.UpsertLessonRequest;
import com.example.DATN.entity.Lesson;
import com.example.DATN.entity.Topic;
import com.example.DATN.repository.content.LessonRepository;
import com.example.DATN.repository.content.TopicRepository;

import jakarta.transaction.Transactional;

import com.example.DATN.repository.projections.LessonManagementProjection;
import java.util.Date;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

// Service xử lý các nghiệp vụ quản trị bài học.
// Chịu trách nhiệm liên kết bài học với chủ đề, quản lý trạng thái xóa mềm 
// và xử lý các thuộc tính bài học (độ khó, trạng thái Premium).
@Service
public class AdminLessonService {
    private final LessonRepository lessonRepository;
    private final TopicRepository topicRepository;

    public AdminLessonService(LessonRepository lessonRepository, TopicRepository topicRepository) {
        this.lessonRepository = lessonRepository;
        this.topicRepository = topicRepository;
    }

    // Lấy toàn bộ danh sách bài học phục vụ bảng quản lý của Admin.
    public List<AdminLessonDto> findAll() {
        return lessonRepository.findLessonManagementRows().stream().map(this::toDto).toList();
    }

    // Lấy chi tiết bài học kèm theo thông tin gán chủ đề.
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
                lesson.views == null ? 0 : lesson.views,
                lesson.createdAt,
                lesson.updatedAt,
                lesson.deletedAt);
    }

    // Tạo mới một bài học. Kiểm tra trùng tên trước khi lưu.
    public AdminLessonDto create(UpsertLessonRequest request) {
        String name = request == null || request.name() == null ? "" : request.name().trim();
        if (lessonRepository.existsByNameIgnoreCase(name)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Tên/Nội dung này đã tồn tại, vui lòng chọn tên khác");
        }
        Lesson lesson = new Lesson();
        apply(lesson, request);
        Lesson saved = lessonRepository.save(lesson);
        return findById(saved.id);
    }

    // Cập nhật thông tin bài học hiện có.
    public AdminLessonDto update(Long id, UpsertLessonRequest request) {
        String name = request == null || request.name() == null ? "" : request.name().trim();
        if (lessonRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Tên/Nội dung này đã tồn tại, vui lòng chọn tên khác");
        }
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found"));
        apply(lesson, request);
        lessonRepository.save(lesson);
        return findById(id);
    }

    // Xóa bài học (Xóa mềm hoặc xóa vĩnh viễn).
    public void delete(Long id, boolean force) {
        if (force) {
            lessonRepository.hardDelete(id);
        } else {
            Lesson lesson = lessonRepository.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found"));
            lesson.status = "Tạm dừng"; // Trạng thái khi bị xóa mềm
            lesson.deletedAt = new Date();
            lessonRepository.save(lesson);
        }
    }

    // Chuyển đổi và áp dụng dữ liệu từ Request DTO vào Entity Lesson.
    // Xử lý liên kết với Topic và thiết lập các thuộc tính bài học.
    private void apply(Lesson lesson, UpsertLessonRequest request) {
        String name = request == null ? "" : defaultString(request.name(), "").trim();
        if (name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Vui lòng nhập đầy đủ các trường thông tin bắt buộc");
        }
        if (request == null || request.topicId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Vui lòng nhập đầy đủ các trường thông tin bắt buộc");
        }

        // Tìm chủ đề tương ứng để gán bài học vào (Topic - Lesson: 1-n)
        Topic topic = topicRepository.findById(request.topicId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Topic not found"));

        lesson.name = name;
        lesson.description = request == null ? "" : defaultString(request.description(), "").trim();
        lesson.topic = topic;
        lesson.difficulty = normalizeDifficulty(request == null ? null : request.difficulty());
        lesson.status = defaultString(request == null ? null : request.status(), "Đang mở");
        lesson.lessonImage = request == null ? null : request.lessonImage();
        // Thiết lập trạng thái Premium (Gating Content)
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
                row.getViews() == null ? 0 : row.getViews(),
                row.getCreatedAt(),
                row.getUpdatedAt(),
                null); // deletedAt is usually NULL for management rows
    }

    private String normalizeDifficulty(String value) {
        if (value == null || value.isBlank()) {
            return "Trung bình";
        }
        return value.trim();
    }

    private String defaultString(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value;
    }

    // Truy vấn danh sách các bài học đã bị xóa mềm phục vụ Thùng rác.
    public List<LessonManagementProjection> getDeletedLessons() {
        return lessonRepository.findDeletedRows();
    }

    // Khôi phục bài học đã bị xóa mềm bằng cách xóa giá trị deletedAt.
    @Transactional
    public void restore(Long id) {
        lessonRepository.restore(id);
    }
}
