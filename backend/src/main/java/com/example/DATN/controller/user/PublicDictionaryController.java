package com.example.DATN.controller.user;

import com.example.DATN.dto.user.*;

import com.example.DATN.service.user.AiDictionaryService;
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
    public ReadingWordLookupResponse lookup(
            @RequestParam String word,
            @RequestParam(required = false, defaultValue = "") String context,
            @RequestParam(required = false) Long userId) throws Exception {

        Map<String, String> aiData = aiDictionaryService.lookupWord(word, context, userId);

        // Chuyển đổi dữ liệu phẳng từ AI sang cấu trúc ReadingWordLookupResponse
        // mà frontend VideoWatch đang mong đợi (meanings, pronunciations, ...)

        String rootWord = aiData.getOrDefault("word", word);
        String phonetic = aiData.getOrDefault("phonetic", "");
        String typeOfWord = aiData.getOrDefault("typeOfWord", "");
        String definitionEn = aiData.getOrDefault("definitionEn", "");
        String definitionVi = aiData.getOrDefault("definitionVi", "");
        String example = aiData.getOrDefault("example", "");
        String exampleVi = aiData.getOrDefault("exampleVi", "");
        String level = aiData.getOrDefault("level", "B1");

        java.util.List<ReadingWordLookupResponse.PronunciationItem> pronunciations = new java.util.ArrayList<>();
        if (!phonetic.isEmpty()) {
            pronunciations.add(new ReadingWordLookupResponse.PronunciationItem("IPA", phonetic, null));
        }

        java.util.List<ReadingWordLookupResponse.MeaningItem> meanings = new java.util.ArrayList<>();
        meanings.add(new ReadingWordLookupResponse.MeaningItem(
                0, typeOfWord, definitionEn, definitionVi, example, true));

        return new ReadingWordLookupResponse(
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
                typeOfWord);
    }
}
