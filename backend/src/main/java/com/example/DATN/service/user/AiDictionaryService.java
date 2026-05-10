package com.example.DATN.service.user;

import com.example.DATN.repository.content.VocabularyRepository;
import com.example.DATN.repository.user.LookupHistoryRepository;

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

    @org.springframework.beans.factory.annotation.Autowired
    private VocabularyRepository vocabularyRepository;

    @org.springframework.beans.factory.annotation.Autowired
    private LookupHistoryRepository lookupHistoryRepository;

    public AiDictionaryService(PremiumService premiumService) {
        this.premiumService = premiumService;
    }

    public Map<String, Object> lookupFullDictionary(String word, Long userId) throws Exception {
        if (word != null && !word.isBlank()) {
            String w = word.trim().toLowerCase();

            // 1. Check curated vocabulary
            java.util.Optional<com.example.DATN.entity.Vocabulary> curated = vocabularyRepository
                    .findFirstByWordIgnoreCase(w);
            if (curated.isPresent()) {
                com.example.DATN.entity.Vocabulary v = curated.get();
                Map<String, Object> cached = new HashMap<>();
                cached.put("word", v.word);
                cached.put("phonetic", v.pronunciation != null ? v.pronunciation : "");

                java.util.List<Map<String, Object>> ms = new java.util.ArrayList<>();
                Map<String, Object> m = new HashMap<>();
                m.put("typeOfWord", v.typeOfWord != null ? v.typeOfWord : "noun");
                m.put("level", v.level != null ? v.level : "");
                m.put("definition", v.meaningEn);
                m.put("meaningVi", v.meaningVi);
                java.util.List<String> exs = new java.util.ArrayList<>();
                if (v.example != null && !v.example.isBlank())
                    exs.add(v.example);
                m.put("examples", exs);
                ms.add(m);

                cached.put("meanings", ms);
                return cached;
            }

            // 2. Check global lookup history
            java.util.Optional<com.example.DATN.entity.LookupHistory> globalExisting = lookupHistoryRepository
                    .findTopByWordOrderByCreatedAtDesc(w);
            if (globalExisting.isPresent()) {
                com.example.DATN.entity.LookupHistory history = globalExisting.get();
                if (history.definitionsJson != null && !history.definitionsJson.isBlank()) {
                    try {
                        java.util.List<Map<String, Object>> meanings = objectMapper.readValue(
                                history.definitionsJson,
                                objectMapper.getTypeFactory().constructCollectionType(java.util.List.class, Map.class));

                        Map<String, Object> cached = new HashMap<>();
                        cached.put("word", history.word);
                        cached.put("phonetic", meanings.size() > 0 ? "" : "");

                        java.util.List<Map<String, Object>> ms = new java.util.ArrayList<>();
                        for (Map<String, Object> mOrig : meanings) {
                            Map<String, Object> m = new HashMap<>();
                            m.put("typeOfWord", mOrig.get("typeOfWord") != null ? mOrig.get("typeOfWord")
                                    : (mOrig.get("type_of_word") != null ? mOrig.get("type_of_word") : "noun"));
                            m.put("level", mOrig.get("level") != null ? mOrig.get("level") : "");
                            m.put("definition", mOrig.get("definition") != null ? mOrig.get("definition")
                                    : (mOrig.get("meaningEn") != null ? mOrig.get("meaningEn") : ""));
                            m.put("meaningVi", mOrig.get("meaningVi") != null ? mOrig.get("meaningVi")
                                    : (mOrig.get("definitionVi") != null ? mOrig.get("definitionVi") : ""));
                            m.put("examples",
                                    mOrig.get("examples") != null ? mOrig.get("examples")
                                            : (mOrig.get("example") != null
                                                    ? java.util.List.of(mOrig.get("example").toString())
                                                    : new java.util.ArrayList<>()));
                            ms.add(m);
                        }

                        cached.put("meanings", ms);
                        return cached;
                    } catch (Exception ignore) {
                    }
                }
            }
        }

        premiumService.checkAndIncrementLookupLimit(userId);

        if (openAiApiKey == null || openAiApiKey.isBlank()) {
            throw new RuntimeException("OpenAI API key chưa được cấu hình");
        }

        String prompt = String.format(
                "Acting as a comprehensive English-Vietnamese dictionary, analyze the word '%s'.\n" +
                        "Provide a detailed response in VALID JSON format with these exact keys:\n" +
                        "- 'word': the base form.\n" +
                        "- 'phonetic': IPA pronunciation.\n" +
                        "- 'meanings': an array of objects, each containing:\n" +
                        "  - 'typeOfWord': e.g., 'noun', 'verb', 'adjective'.\n" +
                        "  - 'level': CEFR level (A1-C2).\n" +
                        "  - 'definition': clear English definition.\n" +
                        "  - 'meaningVi': concise Vietnamese definition.\n" +
                        "  - 'examples': an array of English example sentences.\n" +
                        "\nProvide 1-3 most common meanings. Output ONLY raw JSON.",
                word);

        Map<String, Object> payload = new HashMap<>();
        payload.put("model", openAiModel);
        payload.put("messages", new Object[] {
                new HashMap<String, String>() {
                    {
                        put("role", "system");
                        put("content", "You are a specialized dictionary AI. Always respond in valid JSON.");
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

        HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("OpenAI API error: " + response.body());
        }

        JsonNode root = objectMapper.readTree(response.body());
        String content = root.path("choices").get(0).path("message").path("content").asText();

        return objectMapper.readValue(extractJsonFromMarkdown(content), Map.class);
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
                        "- 'context_translation': natural Vietnamese translation of the FULL context sentence provided.\n"
                        +
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
        if (content == null || content.isBlank())
            return "{}";

        // Find the first '{' and the last '}' to extract the JSON object
        int firstBrace = content.indexOf("{");
        int lastBrace = content.lastIndexOf("}");

        if (firstBrace != -1 && lastBrace != -1 && lastBrace > firstBrace) {
            return content.substring(firstBrace, lastBrace + 1);
        }

        return content.trim();
    }
}
