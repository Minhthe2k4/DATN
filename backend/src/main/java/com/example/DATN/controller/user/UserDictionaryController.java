package com.example.DATN.controller.user;

import com.example.DATN.dto.user.WordLookupRequest;
import com.example.DATN.service.user.AiDictionaryService;

import java.util.HashMap;
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
    private AiDictionaryService aiDictionaryService;

    /**
     * Tra từ điển Full AI (Phát âm, Nghĩa Anh-Việt, Ví dụ, Level trong 1 request)
     */
    @PostMapping("/lookup")
    public Map<String, Object> lookupWord(
            @RequestBody WordLookupRequest request,
            org.springframework.security.core.Authentication auth,
            jakarta.servlet.http.HttpServletRequest httpRequest) throws Exception {
        if (request == null || request.word() == null || request.word().trim().isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Word is required");
            return error;
        }

        Long userId = com.example.DATN.util.AuthUtil.getUserId(auth, httpRequest);

        // Gọi Full AI (1 request duy nhất thay vì lặp qua từng nghĩa)
        return aiDictionaryService.lookupFullDictionary(request.word(), userId);
    }
}
