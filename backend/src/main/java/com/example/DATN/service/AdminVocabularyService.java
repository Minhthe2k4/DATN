package com.example.DATN.service;

import com.example.DATN.dto.AdminVocabularyDto;
import com.example.DATN.dto.UpsertVocabularyRequest;
import com.example.DATN.entity.LessonVocabulary;
import com.example.DATN.entity.LessonVocabularyId;
import com.example.DATN.entity.Vocabulary;
import com.example.DATN.repository.LessonRepository;
import com.example.DATN.repository.LessonVocabularyRepository;
import com.example.DATN.repository.VocabularyRepository;
import com.example.DATN.repository.VocabularyManagementProjection;
import java.util.List;
import java.util.Locale;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminVocabularyService {
    private final VocabularyRepository vocabularyRepository;
    private final LessonRepository lessonRepository;
    private final LessonVocabularyRepository lessonVocabularyRepository;

    public AdminVocabularyService(
            VocabularyRepository vocabularyRepository,
            LessonRepository lessonRepository,
            LessonVocabularyRepository lessonVocabularyRepository
    ) {
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
                toLong(Math.toIntExact(vocabulary.id)),
                defaultString(vocabulary.word, ""),
                defaultString(vocabulary.pronunciation, ""),
                defaultString(vocabulary.partOfSpeech, "noun"),
                defaultString(vocabulary.meaningEn, ""),
                defaultString(vocabulary.meaningVi, ""),
                defaultString(vocabulary.example, ""),
                defaultString(vocabulary.exampleVi, ""),
                normalizeDifficulty(vocabulary.level),
                "Đã duyệt",
                lessonId,
                null
        );
    }

    public AdminVocabularyDto create(UpsertVocabularyRequest request) {
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
            
            return findById(toLong(Math.toIntExact(saved.id)));
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vocabulary word already exists");
        }
    }

    public AdminVocabularyDto update(Long id, UpsertVocabularyRequest request) {
        Vocabulary vocabulary = vocabularyRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vocabulary not found"));

        Long newLessonId = request.lessonId();
        apply(vocabulary, request);
        try {
            vocabularyRepository.save(vocabulary);
            
            // Update lesson-vocabulary relationship
            // First, remove vocabulary from all lessons
            lessonVocabularyRepository.findAll().forEach(lv -> {
                if (lv.vocabId.equals(id)) {
                    lessonVocabularyRepository.delete(lv);
                }
            });
            
            // Then add to new lesson if specified
            if (newLessonId != null) {
                LessonVocabulary lessonVocab = new LessonVocabulary();
                lessonVocab.lessonId = newLessonId;
                lessonVocab.vocabId = id;
                lessonVocabularyRepository.save(lessonVocab);
            }
            
            return findById(id);
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vocabulary word already exists");
        }
    }

    public void delete(Long id) {
        if (!vocabularyRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Vocabulary not found");
        }
        
        // Remove from all lessons first
        lessonVocabularyRepository.findAll().forEach(lv -> {
            if (lv.vocabId.equals(id)) {
                lessonVocabularyRepository.delete(lv);
            }
        });
        
        // Then delete the vocabulary
        vocabularyRepository.deleteById(id);
    }

    private void apply(Vocabulary vocabulary, UpsertVocabularyRequest request) {
        String word = request == null ? "" : defaultString(request.word(), "").trim();
        if (word.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vocabulary word is required");
        }

        if (request == null || request.lessonId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lesson is required");
        }

        lessonRepository.findById(request.lessonId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lesson not found"));

        vocabulary.word = word;
        vocabulary.pronunciation = defaultString(request.pronunciation(), "").trim();
        vocabulary.partOfSpeech = defaultString(request.partOfSpeech(), "noun").trim();
        vocabulary.meaningEn = defaultString(request.meaningEn(), "").trim();
        vocabulary.meaningVi = defaultString(request.meaningVi(), "").trim();
        vocabulary.example = defaultString(request.example(), "").trim();
        vocabulary.exampleVi = defaultString(request.exampleVi(), "").trim();
        vocabulary.level = normalizeDifficulty(request.level());
    }

    private AdminVocabularyDto toDto(VocabularyManagementProjection row) {
        // Get lessonId from LessonVocabulary table
        Long lessonId = findLessonIdForVocabulary(row.getId());

        return new AdminVocabularyDto(
                row.getId(),
                defaultString(row.getWord(), ""),
                defaultString(row.getPronunciation(), ""),
                defaultString(row.getPartOfSpeech(), "noun"),
                defaultString(row.getMeaningEn(), ""),
                defaultString(row.getMeaningVi(), ""),
                defaultString(row.getExample(), ""),
                defaultString(row.getExampleVi(), ""),
                normalizeDifficulty(row.getLevel()),
                "Đã duyệt",
                lessonId,
                null
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

    private String defaultString(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value;
    }

    private Long toLong(Integer value) {
        return value == null ? null : value.longValue();
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
}
