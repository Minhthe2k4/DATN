package com.example.DATN.util;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Component
public class OpenAIUtil {

    @Value("${datn.ai.openai-api-key:}")
    private String openaiApiKey;

    @Value("${datn.ai.openai-model:gpt-4o-mini}")
    private String openaiModel;

    private static final String OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
    private static final HttpClient httpClient = HttpClient.newHttpClient();

    /**
     * Translate English definition to Vietnamese using OpenAI
     * Returns concise Vietnamese phrase (noun phrase only, no full sentence)
     */
    public String translateToVietnamese(String englishDefinition) {
        if (openaiApiKey == null || openaiApiKey.trim().isEmpty()) {
            System.out.println("[OpenAI] API key not configured, skipping translation");
            return "";
        }

        try {
            JSONObject message = new JSONObject();
            message.put("role", "user");
            message.put("content", String.format(
                "Translate this English definition to a SHORT Vietnamese phrase (noun phrase only, no full sentence, max 3-5 words). " +
                "Example: English 'move quickly' → Vietnamese 'di chuyển nhanh' or just 'chạy'. " +
                "Definition: \"%s\"\n" +
                "Reply ONLY with the Vietnamese phrase, no other text.",
                englishDefinition
            ));

            JSONArray messages = new JSONArray();
            messages.put(message);

            JSONObject requestBody = new JSONObject();
            requestBody.put("model", openaiModel);
            requestBody.put("messages", messages);
            requestBody.put("max_tokens", 50);
            requestBody.put("temperature", 0.3);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(OPENAI_API_URL))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + openaiApiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody.toString()))
                    .timeout(java.time.Duration.ofSeconds(10))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                System.err.println("[OpenAI] Translation failed: " + response.body());
                return "";
            }

            JSONObject responseBody = new JSONObject(response.body());
            String translation = responseBody
                    .getJSONArray("choices")
                    .getJSONObject(0)
                    .getJSONObject("message")
                    .getString("content")
                    .trim();

            System.out.println("[OpenAI] Translation: " + translation);
            return translation;

        } catch (Exception e) {
            System.err.println("[OpenAI] Translation error: " + e.getMessage());
            return "";
        }
    }

    /**
     * Predict CEFR level (A1, A2, B1, B2, C1, C2) based on word and definition
     * Using Cambridge & Oxford CEFR standards
     */
    public String predictCEFRLevel(String word, String englishDefinition) {
        if (openaiApiKey == null || openaiApiKey.trim().isEmpty()) {
            return estimateLevelLocally(word, englishDefinition);
        }

        try {
            JSONObject message = new JSONObject();
            message.put("role", "user");
            message.put("content", String.format(
                "Based on Cambridge and Oxford CEFR standards, predict the CEFR level (A1, A2, B1, B2, C1, or C2) for this word.\n\n" +
                "CEFR Levels:\n" +
                "A1: Basic words (common daily items, simple actions) - 'eat', 'book', 'hello'\n" +
                "A2: Elementary (family, home, work basics) - 'furniture', 'friendly', 'explain'\n" +
                "B1: Intermediate (complex ideas, some specialization) - 'appreciate', 'considerable', 'integrate'\n" +
                "B2: Upper-intermediate (professional contexts, nuanced meanings) - 'advocate', 'reluctant', 'scrutiny'\n" +
                "C1: Advanced (sophisticated, formal language) - 'nuance', 'precipitate', 'ambiguous'\n" +
                "C2: Mastery (rare, literary, highly specialized) - 'obfuscate', 'perspicacity', 'solipsistic'\n\n" +
                "Word: \"%s\"\n" +
                "Definition: \"%s\"\n\n" +
                "Reply ONLY with the CEFR level code (e.g., B1), no other text.",
                word, englishDefinition
            ));

            JSONArray messages = new JSONArray();
            messages.put(message);

            JSONObject requestBody = new JSONObject();
            requestBody.put("model", openaiModel);
            requestBody.put("messages", messages);
            requestBody.put("max_tokens", 5);
            requestBody.put("temperature", 0.2);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(OPENAI_API_URL))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + openaiApiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody.toString()))
                    .timeout(java.time.Duration.ofSeconds(10))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                System.err.println("[OpenAI] Level prediction failed: " + response.body());
                return estimateLevelLocally(word, englishDefinition);
            }

            JSONObject responseBody = new JSONObject(response.body());
            String level = responseBody
                    .getJSONArray("choices")
                    .getJSONObject(0)
                    .getJSONObject("message")
                    .getString("content")
                    .trim()
                    .toUpperCase();

            // Validate CEFR level format
            if (level.matches("[A-C][12]")) {
                System.out.println("[OpenAI] Predicted CEFR level: " + level);
                return level;
            }

            return estimateLevelLocally(word, englishDefinition);

        } catch (Exception e) {
            System.err.println("[OpenAI] Level prediction error: " + e.getMessage());
            return estimateLevelLocally(word, englishDefinition);
        }
    }

    /**
     * Fallback: Estimate CEFR level based on word characteristics
     */
    private String estimateLevelLocally(String word, String definition) {
        // Simple heuristic: based on word length and definition complexity
        int wordLen = word.length();
        int defLen = definition.length();
        int wordCount = definition.split("\\s+").length;

        if (wordLen <= 3) return "A1";
        if (wordLen <= 5 && defLen <= 50) return "A2";
        if (wordLen <= 7 && defLen <= 80 && wordCount <= 8) return "B1";
        if (wordLen <= 8 && defLen <= 100 && wordCount <= 12) return "B2";
        if (defLen > 100 && wordCount > 12) return "C1";
        return "B1";
    }

    /**
     * Analyze the primary meaning of a word in a given context using AI
     */
    public String analyzeContextMeaning(String word, String contextSentence) {
        if (openaiApiKey == null || openaiApiKey.trim().isEmpty()) {
            return "";
        }

        try {
            JSONObject message = new JSONObject();
            message.put("role", "user");
            message.put("content", String.format(
                "Analyze the context and determine the PRIMARY meaning of the word \"%s\" in this sentence.\n\n" +
                "Context: \"%s\"\n\n" +
                "Provide a SHORT explanation (1-2 sentences max) of what \"%s\" means in this specific context. " +
                "Focus on the core meaning the author intended.\n\n" +
                "Reply with ONLY the meaning explanation, no other text.",
                word, contextSentence, word
            ));

            JSONArray messages = new JSONArray();
            messages.put(message);

            JSONObject requestBody = new JSONObject();
            requestBody.put("model", openaiModel);
            requestBody.put("messages", messages);
            requestBody.put("max_tokens", 100);
            requestBody.put("temperature", 0.3);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(OPENAI_API_URL))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + openaiApiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody.toString()))
                    .timeout(java.time.Duration.ofSeconds(10))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                System.err.println("[OpenAI] Context analysis failed: " + response.body());
                return "";
            }

            JSONObject responseBody = new JSONObject(response.body());
            String meaning = responseBody
                    .getJSONArray("choices")
                    .getJSONObject(0)
                    .getJSONObject("message")
                    .getString("content")
                    .trim();

            System.out.println("[OpenAI] Context meaning: " + meaning);
            return meaning;

        } catch (Exception e) {
            System.err.println("[OpenAI] Context analysis error: " + e.getMessage());
            return "";
        }
    }

    /**
     * Find the best matching definition for a context meaning
     */
    public int findBestMatchingDefinition(String contextMeaning, java.util.List<java.util.Map<String, Object>> meanings) {
        if (contextMeaning == null || contextMeaning.isEmpty() || meanings == null || meanings.isEmpty()) {
            return -1;
        }

        try {
            // Prepare definitions list
            StringBuilder defsBuilder = new StringBuilder();
            for (int i = 0; i < meanings.size(); i++) {
                java.util.Map<String, Object> m = meanings.get(i);
                String definition = (String) m.getOrDefault("definition", "");
                defsBuilder.append(i).append(". ").append(definition).append("\n");
            }

            JSONObject message = new JSONObject();
            message.put("role", "user");
            message.put("content", String.format(
                "Match the context meaning to the most appropriate definition number.\n\n" +
                "Context Meaning: \"%s\"\n\n" +
                "Available Definitions:\n%s\n" +
                "Return ONLY the definition number (0, 1, 2, etc) that best matches the context meaning. " +
                "If none match well, return -1.",
                contextMeaning, defsBuilder.toString()
            ));

            JSONArray messages = new JSONArray();
            messages.put(message);

            JSONObject requestBody = new JSONObject();
            requestBody.put("model", openaiModel);
            requestBody.put("messages", messages);
            requestBody.put("max_tokens", 5);
            requestBody.put("temperature", 0.1);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(OPENAI_API_URL))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + openaiApiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody.toString()))
                    .timeout(java.time.Duration.ofSeconds(10))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                System.err.println("[OpenAI] Definition matching failed: " + response.body());
                return -1;
            }

            JSONObject responseBody = new JSONObject(response.body());
            String result = responseBody
                    .getJSONArray("choices")
                    .getJSONObject(0)
                    .getJSONObject("message")
                    .getString("content")
                    .trim();

            try {
                int index = Integer.parseInt(result);
                System.out.println("[OpenAI] Best matching definition index: " + index);
                return index;
            } catch (NumberFormatException e) {
                System.err.println("[OpenAI] Could not parse definition index: " + result);
                return -1;
            }

        } catch (Exception e) {
            System.err.println("[OpenAI] Definition matching error: " + e.getMessage());
            return -1;
        }
    }
}
