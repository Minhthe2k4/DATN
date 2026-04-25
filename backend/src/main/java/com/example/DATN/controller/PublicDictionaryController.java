package com.example.DATN.controller;

import com.example.DATN.service.AiDictionaryService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dictionary")
public class PublicDictionaryController {

    private final AiDictionaryService aiDictionaryService;

    public PublicDictionaryController(AiDictionaryService aiDictionaryService) {
        this.aiDictionaryService = aiDictionaryService;
    }

    @GetMapping("/lookup")
    public com.example.DATN.dto.ReadingWordLookupResponse lookup(
            @RequestParam String word,
            @RequestParam(required = false, defaultValue = "") String context,
            @RequestParam(required = false) Long userId) throws Exception {
        
        Map<String, String> aiData = aiDictionaryService.lookupWord(word, context, userId);
        
        // Chuyển đổi dữ liệu phẳng từ AI sang cấu trúc ReadingWordLookupResponse
        // mà frontend VideoWatch đang mong đợi (meanings, pronunciations, ...)
        
        String rootWord = aiData.getOrDefault("word", word);
        String phonetic = aiData.getOrDefault("phonetic", "");
        String partOfSpeech = aiData.getOrDefault("partOfSpeech", "");
        String definitionEn = aiData.getOrDefault("definitionEn", "");
        String definitionVi = aiData.getOrDefault("definitionVi", "");
        String example = aiData.getOrDefault("example", "");
        String exampleVi = aiData.getOrDefault("exampleVi", "");
        String level = aiData.getOrDefault("level", "B1");

        java.util.List<com.example.DATN.dto.ReadingWordLookupResponse.PronunciationItem> pronunciations = new java.util.ArrayList<>();
        if (!phonetic.isEmpty()) {
            pronunciations.add(new com.example.DATN.dto.ReadingWordLookupResponse.PronunciationItem("IPA", phonetic, null));
        }

        java.util.List<com.example.DATN.dto.ReadingWordLookupResponse.MeaningItem> meanings = new java.util.ArrayList<>();
        meanings.add(new com.example.DATN.dto.ReadingWordLookupResponse.MeaningItem(
            0, partOfSpeech, definitionEn, definitionVi, example, true
        ));

        return new com.example.DATN.dto.ReadingWordLookupResponse(
            rootWord,
            word,
            level,
            "AI-Dictionary",
            context,
            true,
            0,
            pronunciations,
            meanings,
            exampleVi,
            partOfSpeech
        );
    }
}
