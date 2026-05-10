package com.example.DATN.service.admin;

import com.example.DATN.dto.admin.*;
import com.example.DATN.entity.LessonVocabulary;
import com.example.DATN.entity.Vocabulary;
import com.example.DATN.repository.content.LessonRepository;
import com.example.DATN.repository.content.LessonVocabularyRepository;
import com.example.DATN.repository.content.VocabularyRepository;
import com.example.DATN.repository.projections.VocabularyManagementProjection;
import java.util.Date;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminVocabularyService {
    private final VocabularyRepository vocabularyRepository;
    private final LessonRepository lessonRepository;
    private final LessonVocabularyRepository lessonVocabularyRepository;

    public AdminVocabularyService(
            VocabularyRepository vocabularyRepository,
            LessonRepository lessonRepository,
            LessonVocabularyRepository lessonVocabularyRepository) {
        this.vocabularyRepository = vocabularyRepository;
        this.lessonRepository = lessonRepository;
        this.lessonVocabularyRepository = lessonVocabularyRepository;
    }

    public List<AdminVocabularyDto> findAll() {
        return vocabularyRepository.findVocabularyManagementRows().stream().map(this::toDto).toList();
    }

    public AdminVocabularyDto findById(Long id) {
        Vocabulary vocabulary = vocabularyRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vocabulary not found"));

        // Get lessonId from LessonVocabulary table
        Long lessonId = findLessonIdForVocabulary(id);

        return new AdminVocabularyDto(
                vocabulary.id,
                defaultString(vocabulary.word, ""),
                defaultString(vocabulary.pronunciation, ""),
                defaultString(vocabulary.typeOfWord, "noun"),
                defaultString(vocabulary.meaningEn, ""),
                defaultString(vocabulary.meaningVi, ""),
                defaultString(vocabulary.example, ""),
                defaultString(vocabulary.exampleVi, ""),
                normalizeDifficulty(vocabulary.level),
                defaultString(vocabulary.status, "Đã duyệt"),
                lessonId,
                null,
                vocabulary.createdAt,
                vocabulary.updatedAt,
                vocabulary.deletedAt);
    }

    public AdminVocabularyDto create(UpsertVocabularyRequest request) {
        String word = request == null || request.word() == null ? "" : request.word().trim();
        if (vocabularyRepository.existsByWordIgnoreCase(word)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Tên/Nội dung này đã tồn tại, vui lòng chọn tên khác");
        }
        Vocabulary vocabulary = new Vocabulary();
        Long lessonId = request.lessonId();
        apply(vocabulary, request);
        try {
            Vocabulary saved = vocabularyRepository.save(vocabulary);

            // Save lesson-vocabulary relationship
            if (lessonId != null) {
                LessonVocabulary lessonVocab = new LessonVocabulary();
                lessonVocab.lessonId = lessonId;
                lessonVocab.vocabId = saved.id;
                lessonVocabularyRepository.save(lessonVocab);
            }

            return findById(saved.id);
        } catch (DataIntegrityViolationException ex) {
            String msg = ex.getMessage();
            if (msg != null && (msg.contains("Duplicate entry") || msg.contains("unique"))) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Tên/Nội dung này đã tồn tại, vui lòng chọn tên khác");
            }
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Lỗi dữ liệu: " + (ex.getMessage() != null ? ex.getMessage() : "Yêu cầu không hợp lệ"));
        }
    }

    @Transactional
    public AdminVocabularyDto update(Long id, UpsertVocabularyRequest request) {
        String word = request == null || request.word() == null ? "" : request.word().trim();
        if (vocabularyRepository.existsByWordIgnoreCaseAndIdNot(word, id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Tên/Nội dung này đã tồn tại, vui lòng chọn tên khác");
        }
        Vocabulary vocabulary = vocabularyRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vocabulary not found"));

        Long newLessonId = request.lessonId();
        apply(vocabulary, request);
        try {
            vocabularyRepository.save(vocabulary);

            // Update lesson-vocabulary relationship
            // First, remove vocabulary from all lessons
            lessonVocabularyRepository.deleteByVocabId(id);

            // Then add to new lesson if specified
            if (newLessonId != null) {
                LessonVocabulary lessonVocab = new LessonVocabulary();
                lessonVocab.lessonId = newLessonId;
                lessonVocab.vocabId = id;
                lessonVocabularyRepository.save(lessonVocab);
            }

            return findById(id);
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Có lỗi xảy ra khi lưu dữ liệu.");
        }
    }

    @Transactional
    public void delete(Long id, boolean force) {
        if (force) {
            lessonVocabularyRepository.deleteByVocabId(id);
            vocabularyRepository.hardDelete(id);
        } else {
            Vocabulary vocabulary = vocabularyRepository.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vocabulary not found"));
            vocabulary.status = "Từ chối"; // Soft delete
            vocabulary.deletedAt = new Date();
            vocabularyRepository.save(vocabulary);
        }
    }

    private void apply(Vocabulary vocabulary, UpsertVocabularyRequest request) {
        String word = request == null ? "" : defaultString(request.word(), "").trim();
        if (word.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Vui lòng nhập đầy đủ các trường thông tin bắt buộc");
        }

        if (request == null || request.lessonId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Vui lòng nhập đầy đủ các trường thông tin bắt buộc");
        }

        lessonRepository.findById(request.lessonId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lesson not found"));

        vocabulary.word = word;
        vocabulary.pronunciation = defaultString(request.pronunciation(), "").trim();
        vocabulary.typeOfWord = defaultString(request.typeOfWord(), "noun").trim();
        vocabulary.meaningEn = defaultString(request.meaningEn(), "").trim();
        vocabulary.meaningVi = defaultString(request.meaningVi(), "").trim();
        vocabulary.example = defaultString(request.example(), "").trim();
        vocabulary.exampleVi = defaultString(request.exampleVi(), "").trim();
        vocabulary.level = normalizeDifficulty(request.level());
        vocabulary.status = defaultString(request.status(), "Chờ duyệt").trim();
    }

    private AdminVocabularyDto toDto(VocabularyManagementProjection row) {
        // Get lessonId from LessonVocabulary table
        Long lessonId = findLessonIdForVocabulary(row.getId());

        return new AdminVocabularyDto(
                row.getId(),
                defaultString(row.getWord(), ""),
                defaultString(row.getPronunciation(), ""),
                defaultString(row.getTypeOfWord(), "noun"),
                defaultString(row.getMeaningEn(), ""),
                defaultString(row.getMeaningVi(), ""),
                defaultString(row.getExample(), ""),
                defaultString(row.getExampleVi(), ""),
                normalizeDifficulty(row.getLevel()),
                defaultString(row.getStatus(), "Đã duyệt"),
                lessonId,
                null,
                row.getCreatedAt(),
                row.getUpdatedAt(),
                row.getDeletedAt());
    }

    private String normalizeDifficulty(String value) {
        if (value == null || value.isBlank()) {
            return "A1";
        }
        String normalized = value.trim();
        // If it's one of the legacy values, we can keep them or map them,
        // but for CEFR (A1-C2), we should just return the value.
        return normalized;
    }

    private String defaultString(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value;
    }

    private Long findLessonIdForVocabulary(Long vocabId) {
        List<LessonVocabulary> lessonVocabs = lessonVocabularyRepository.findAll();
        for (LessonVocabulary lv : lessonVocabs) {
            if (lv.vocabId.equals(vocabId)) {
                return lv.lessonId;
            }
        }
        return null;
    }

    public List<VocabularyManagementProjection> getDeletedVocabulary() {
        return vocabularyRepository.findDeletedRows();
    }

    @Transactional
    public void restore(Long id) {
        vocabularyRepository.restore(id);
    }
}
