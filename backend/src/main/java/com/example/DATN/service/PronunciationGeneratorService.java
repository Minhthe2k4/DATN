package com.example.DATN.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PronunciationGeneratorService {
    private static final String DICTIONARY_API_BASE = "https://api.dictionaryapi.dev/api/v2/entries/en/";

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient;

    public PronunciationGeneratorService() {
        this.httpClient = HttpClient.newHttpClient();
    }

    public String generate(String rawWord) {
        return generateResult(rawWord).pronunciation();
    }

    public GenerationResult generateResult(String rawWord) {
        String word = normalizeWord(rawWord);
        if (word.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Word is required");
        }

        String fromDictionary = fetchFromDictionaryApi(word);
        if (!fromDictionary.isBlank()) {
            return new GenerationResult(fromDictionary, "dictionaryapi");
        }

        return new GenerationResult("/" + word.toLowerCase() + "/", "fallback");
    }

    private String fetchFromDictionaryApi(String word) {
        try {
            String encodedWord = URLEncoder.encode(word, StandardCharsets.UTF_8);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(DICTIONARY_API_BASE + encodedWord))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                return "";
            }

            JsonNode root = objectMapper.readTree(response.body());
            if (!root.isArray() || root.isEmpty()) {
                return "";
            }

            JsonNode firstEntry = root.get(0);
            String phonetic = textOrEmpty(firstEntry.get("phonetic"));
            if (!phonetic.isBlank()) {
                return ensureWrapped(phonetic);
            }

            JsonNode phonetics = firstEntry.get("phonetics");
            if (phonetics != null && phonetics.isArray()) {
                for (JsonNode item : phonetics) {
                    String text = textOrEmpty(item.get("text"));
                    if (!text.isBlank()) {
                        return ensureWrapped(text);
                    }
                }
            }

            return "";
        } catch (Exception ignored) {
            return "";
        }
    }

    private String normalizeWord(String rawWord) {
        if (rawWord == null) {
            return "";
        }
        return rawWord.trim().replaceAll("\\s+", " ");
    }

    private String ensureWrapped(String value) {
        String normalized = value == null ? "" : value.trim();
        if (normalized.isBlank()) {
            return "";
        }
        if (normalized.startsWith("/") && normalized.endsWith("/")) {
            return normalized;
        }
        return "/" + normalized.replace("/", "") + "/";
    }

    private String textOrEmpty(JsonNode node) {
        return node == null || node.isNull() ? "" : node.asText("").trim();
    }

    public record GenerationResult(String pronunciation, String source) {
    }
}
