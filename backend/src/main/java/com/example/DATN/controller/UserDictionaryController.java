package com.example.DATN.controller;

import com.example.DATN.dto.WordLookupRequest;
import com.example.DATN.util.FreeDictionaryUtil;
import com.example.DATN.util.OpenAIUtil;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * API công khai cho tra từ điển
 * Dùng Free Dictionary API (dictionaryapi.dev) - miễn phí, không cần API key
 * Tích hợp AI để dịch sang Tiếng Việt và dự đoán mức CEFR
 */
@RestController
@RequestMapping("/api/dictionary")
public class UserDictionaryController {

    @Autowired
    private OpenAIUtil openAIUtil;

    /**
     * Tra từ điển từ (Free Dictionary API + AI Translation + CEFR Level)
     * POST /api/dictionary/lookup
     * Body: { "word": "example", "contextSentence": "..." }
     */
    @PostMapping("/lookup")
    public Map<String, Object> lookupWord(@RequestBody WordLookupRequest request) {
        if (request == null || request.word() == null || request.word().trim().isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Word is required");
            return error;
        }

        Map<String, Object> result = FreeDictionaryUtil.lookupWord(request.word());
        
        if (result == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Word not found");
            return error;
        }

        // Add AI-powered Vietnamese translations and CEFR levels
        String word = (String) result.get("word");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> meanings = (List<Map<String, Object>>) result.get("meanings");
        
        if (meanings != null && openAIUtil != null) {
            for (Map<String, Object> meaning : meanings) {
                String definition = (String) meaning.get("definition");
                
                // Translate definition to Vietnamese using AI
                if (definition != null && !definition.isEmpty()) {
                    String vietnameseDefinition = openAIUtil.translateToVietnamese(definition);
                    meaning.put("meaningVi", vietnameseDefinition);
                    
                    // Predict CEFR level based on Cambridge/Oxford standards
                    String cefrLevel = openAIUtil.predictCEFRLevel(word, definition);
                    meaning.put("level", cefrLevel);
                }
            }
        }

        return result;
    }
}

