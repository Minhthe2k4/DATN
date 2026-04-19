package com.example.DATN.controller;

import com.example.DATN.dto.AdminVocabularyDto;
import com.example.DATN.dto.GeneratePronunciationRequest;
import com.example.DATN.dto.GeneratePronunciationResponse;
import com.example.DATN.dto.UpsertVocabularyRequest;
import com.example.DATN.service.AdminVocabularyService;
import com.example.DATN.service.PronunciationGeneratorService;
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
@RequestMapping("/api/admin/vocabulary")
public class AdminVocabularyController {
    private final AdminVocabularyService adminVocabularyService;
    private final PronunciationGeneratorService pronunciationGeneratorService;

    public AdminVocabularyController(
            AdminVocabularyService adminVocabularyService,
            PronunciationGeneratorService pronunciationGeneratorService
    ) {
        this.adminVocabularyService = adminVocabularyService;
        this.pronunciationGeneratorService = pronunciationGeneratorService;
    }

    @GetMapping
    public List<AdminVocabularyDto> findAll() {
        return adminVocabularyService.findAll();
    }

    @GetMapping("/{id}")
    public AdminVocabularyDto findById(@PathVariable Long id) {
        return adminVocabularyService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AdminVocabularyDto create(@RequestBody UpsertVocabularyRequest request) {
        return adminVocabularyService.create(request);
    }

    @PostMapping("/pronunciation/generate")
    public GeneratePronunciationResponse generatePronunciation(@RequestBody GeneratePronunciationRequest request) {
        PronunciationGeneratorService.GenerationResult result =
            pronunciationGeneratorService.generateResult(request == null ? null : request.word());
        return new GeneratePronunciationResponse(
            request == null ? "" : request.word(),
            result.pronunciation(),
            result.source()
        );
    }

    @PutMapping("/{id}")
    public AdminVocabularyDto update(@PathVariable Long id, @RequestBody UpsertVocabularyRequest request) {
        return adminVocabularyService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        adminVocabularyService.delete(id);
    }
}
