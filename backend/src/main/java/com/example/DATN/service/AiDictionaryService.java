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

    @Value("${datn.ai.openai-model:gpt-4o-mini}")
    private String openAiModel;

    private final PremiumService premiumService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AiDictionaryService(PremiumService premiumService) {
        this.premiumService = premiumService;
    }

    public Map<String, String> lookupWord(String word, String context, Long userId) throws Exception {
        // 1. Kiểm tra hạn mức qua PremiumService
        premiumService.checkAndIncrementLookupLimit(userId);

        if (openAiApiKey == null || openAiApiKey.isBlank()) {
            throw new RuntimeException("OpenAI API key chưa được cấu hình");
        }

        String prompt = String.format(
                "Analyze the English word '%s' used in this sentence: '%s'.\n" +
                "You must respond with a VALID JSON object containing these exact keys:\n" +
                "- 'root_word': the base form of the word.\n" +
                "- 'phonetic': IPA pronunciation.\n" +
                "- 'level': CEFR level (A1-C2).\n" +
                "- 'type_of_word': e.g., 'noun', 'verb'.\n" +
                "- 'definition_en': a clear English definition.\n" +
                "- 'definition_vi': concise Vietnamese definition (DO NOT leave empty).\n" +
                "- 'example': an English sentence using the root word.\n" +
                "- 'example_vi': Vietnamese translation of the example.\n" +
                "- 'context_translation': natural Vietnamese translation of the FULL context sentence provided.\n" +
                "\nExample format: {\"root_word\": \"...\", \"definition_vi\": \"...\", ...}",
                word, context);

        Map<String, Object> payload = new HashMap<>();
        payload.put("model", openAiModel);
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
                .timeout(java.time.Duration.ofSeconds(15))
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

        HttpResponse<String> response = HttpClient.newBuilder()
                .connectTimeout(java.time.Duration.ofSeconds(10))
                .build()
                .send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("OpenAI API error: " + response.body());
        }

        JsonNode root = objectMapper.readTree(response.body());
        String content = root.path("choices").get(0).path("message").path("content").asText();

        // Parse content JSON từ AI (hỗ trợ bóc tách nếu AI trả về markdown code block)
        String cleanedContent = extractJsonFromMarkdown(content);
        JsonNode resultJson = objectMapper.readTree(cleanedContent);
        Map<String, String> result = new HashMap<>();

        String rootWord = resultJson.path("root_word").asText().trim();
        if (rootWord.isEmpty())
            rootWord = word;

        result.put("word", rootWord);
        result.put("phonetic", resultJson.path("phonetic").asText());
        result.put("level", resultJson.path("level").asText());
        result.put("typeOfWord", resultJson.path("type_of_word").asText());
        result.put("definitionEn", resultJson.path("definition_en").asText());
        result.put("definitionVi", resultJson.path("definition_vi").asText());
        result.put("example", resultJson.path("example").asText());
        result.put("exampleVi", resultJson.path("example_vi").asText());
        result.put("contextTranslation", resultJson.path("context_translation").asText());

        return result;
    }

    private String extractJsonFromMarkdown(String content) {
        if (content == null || content.isBlank()) return "{}";
        
        // Find the first '{' and the last '}' to extract the JSON object
        int firstBrace = content.indexOf("{");
        int lastBrace = content.lastIndexOf("}");
        
        if (firstBrace != -1 && lastBrace != -1 && lastBrace > firstBrace) {
            return content.substring(firstBrace, lastBrace + 1);
        }
        
        return content.trim();
    }
}
