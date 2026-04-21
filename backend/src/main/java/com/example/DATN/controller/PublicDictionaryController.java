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
    public Map<String, String> lookup(
            @RequestParam String word,
            @RequestParam(required = false, defaultValue = "") String context,
            @RequestParam(required = false) Long userId) throws Exception {
        return aiDictionaryService.lookupWord(word, context, userId);
    }
}
