package com.example.DATN.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.Map;

@Service
public class AiDictionaryService {

    @Value("${datn.ai.openai-api-key}")
    private String openAiApiKey;

    private final com.example.DATN.repository.UserRepository userRepository;
    private final PremiumService premiumService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AiDictionaryService(com.example.DATN.repository.UserRepository userRepository,
            PremiumService premiumService) {
        this.userRepository = userRepository;
        this.premiumService = premiumService;
    }

    public Map<String, String> lookupWord(String word, String context, Long userId) throws Exception {
        // 1. Kiểm tra hạn mức qua PremiumService
        premiumService.checkAndIncrementLookupLimit(userId);

        if (openAiApiKey == null || openAiApiKey.isBlank()) {
            throw new RuntimeException("OpenAI API key chưa được cấu hình");
        }

        String prompt = String.format(
                "Explain the word '%s' in the context: '%s'. " +
                        "Provide: phonetic, level (A1-C2), definition_en, definition_vi (concise), example_en, example_vi (translation of example_en). "
                        +
                        "Format the response as a valid JSON object with these keys.",
                word, context);

        Map<String, Object> payload = new HashMap<>();
        payload.put("model", "gpt-3.5-turbo");
        payload.put("messages", new Object[] {
                new HashMap<String, String>() {
                    {
                        put("role", "system");
                        put("content", "You are an expert English-Vietnamese dictionary. Respond only in JSON.");
                    }
                },
                new HashMap<String, String>() {
                    {
                        put("role", "user");
                        put("content", prompt);
                    }
                }
        });

        String jsonPayload = objectMapper.writeValueAsString(payload);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.openai.com/v1/chat/completions"))
                .header("Authorization", "Bearer " + openAiApiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

        HttpResponse<String> response = HttpClient.newHttpClient()
                .send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("OpenAI API error: " + response.body());
        }

        JsonNode root = objectMapper.readTree(response.body());
        String content = root.path("choices").get(0).path("message").path("content").asText();

        // Parse content JSON từ AI
        JsonNode resultJson = objectMapper.readTree(content);
        Map<String, String> result = new HashMap<>();
        result.put("word", word);
        result.put("phonetic", resultJson.path("phonetic").asText());
        result.put("level", resultJson.path("level").asText());
        result.put("definitionEn", resultJson.path("definition_en").asText());
        result.put("definitionVi", resultJson.path("definition_vi").asText());
        result.put("example", resultJson.path("example_en").asText());
        result.put("exampleVi", resultJson.path("example_vi").asText());

        return result;
    }

    private boolean isSameDay(java.util.Date d1, java.util.Date d2) {
        java.text.SimpleDateFormat fmt = new java.text.SimpleDateFormat("yyyyMMdd");
        return fmt.format(d1).equals(fmt.format(d2));
    }
}
