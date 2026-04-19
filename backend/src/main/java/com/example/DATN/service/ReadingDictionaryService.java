package com.example.DATN.service;

import com.example.DATN.dto.SaveReadingWordRequest;
import com.example.DATN.dto.ReadingWordLookupResponse;
import com.example.DATN.entity.Article;
import com.example.DATN.entity.LookupHistory;
import com.example.DATN.entity.User;
import com.example.DATN.entity.UserVocabularyCustom;
import com.example.DATN.repository.ArticleRepository;
import com.example.DATN.repository.LookupHistoryRepository;
import com.example.DATN.repository.UserRepository;
import com.example.DATN.repository.UserVocabularyCustomRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Date;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * Service xử lý Use Case: Đọc báo & Tra từ vựng thông minh (UC_DocBaoAI)
 * Tích hợp công nghệ AI (OpenAI) để giải nghĩa từ vựng theo ngữ cảnh của bài
 * đọc.
 */
@Service
public class ReadingDictionaryService {
    private static final Pattern WORD_PATTERN = Pattern.compile("[A-Za-z][A-Za-z'-]*");
    private static final Pattern JSON_BLOCK_PATTERN = Pattern.compile("\\{[\\s\\S]*}\\s*$");
    private static final int MAX_MEANINGS = 12;

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final UserRepository userRepository;
    private final ArticleRepository articleRepository;
    private final LookupHistoryRepository lookupHistoryRepository;
    private final UserVocabularyCustomRepository userVocabularyCustomRepository;
    private final UserVocabularyCustomService userVocabularyCustomService;
    private final String openAiApiKey;
    private final String openAiModel;

    public ReadingDictionaryService(
            UserRepository userRepository,
            ArticleRepository articleRepository,
            LookupHistoryRepository lookupHistoryRepository,
            UserVocabularyCustomRepository userVocabularyCustomRepository,
            UserVocabularyCustomService userVocabularyCustomService,
            @Value("${datn.ai.openai-api-key:}") String openAiApiKey,
            @Value("${datn.ai.openai-model:gpt-4o-mini}") String openAiModel) {
        this.objectMapper = new ObjectMapper();
        this.userRepository = userRepository;
        this.articleRepository = articleRepository;
        this.lookupHistoryRepository = lookupHistoryRepository;
        this.userVocabularyCustomRepository = userVocabularyCustomRepository;
        this.userVocabularyCustomService = userVocabularyCustomService;
        this.openAiApiKey = openAiApiKey == null ? "" : openAiApiKey.trim();
        this.openAiModel = openAiModel == null || openAiModel.isBlank() ? "gpt-4o-mini" : openAiModel.trim();
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public ReadingWordLookupResponse lookupWord(String word, String contextSentence) {
        return lookupWord(word, contextSentence, null, null);
    }

    /**
     * 1. Chức năng tra cứu từ vựng thông minh trực tiếp khi đang đọc báo.
     * Điểm đặc biệt: Hệ thống gửi cả câu văn chứa từ đó lên AI để lấy nghĩa chính
     * xác nhất theo ngữ cảnh.
     */
    @Transactional
    public ReadingWordLookupResponse lookupWord(String word, String contextSentence, Long userId, Long articleId) {
        String normalizedWord = normalizeWord(word);
        if (normalizedWord.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Word is required");
        }

        String sentence = Optional.ofNullable(contextSentence)
                .map(String::trim)
                .orElse("");

        // Gọi AI để lấy nghĩa từ và bản dịch của cả câu văn
        AiOnlyResult aiResult = lookupWithAiOnly(normalizedWord, sentence);

        List<ReadingWordLookupResponse.MeaningItem> meaningItems = new ArrayList<>();
        meaningItems.add(new ReadingWordLookupResponse.MeaningItem(
                0,
                aiResult.partOfSpeech,
                aiResult.definitionEn,
                aiResult.definitionVi,
                sentence, // Dùng chính câu văn trong bài báo làm ví dụ minh họa
                true));

        List<ReadingWordLookupResponse.PronunciationItem> pronunciations = new ArrayList<>();
        if (!aiResult.ipaUk.isBlank())
            pronunciations.add(new ReadingWordLookupResponse.PronunciationItem("UK", aiResult.ipaUk, ""));
        if (!aiResult.ipaUs.isBlank())
            pronunciations.add(new ReadingWordLookupResponse.PronunciationItem("US", aiResult.ipaUs, ""));

        ReadingWordLookupResponse response = new ReadingWordLookupResponse(
                word == null ? normalizedWord : word.trim(),
                normalizedWord,
                aiResult.level,
                "AI-Generated",
                sentence,
                true,
                0,
                pronunciations,
                meaningItems,
                aiResult.contextTranslation);

        // Lưu lịch sử tra cứu thầm lặng (không làm gián đoạn việc đọc của người dùng)
        persistLookupHistorySilently(userId, articleId, response);
        return response;
    }

    /**
     * 2. Kết nối với Trí tuệ nhân tạo (OpenAI).
     * AI sẽ phân tích và trả về: Nghĩa từ, phiên âm IPA, cấp độ (A1-C2) và bản dịch
     * tiếng Việt của câu văn.
     */
    private AiOnlyResult lookupWithAiOnly(String word, String sentence) {
        if (openAiApiKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "AI Lookup is not configured (missing API Key)");
        }

        String prompt = "You are a linguistics expert and a bilingual English-Vietnamese dictionary. " +
                "Given a word and its context sentence from an article, generate a concise dictionary entry for that word "
                +
                "specifcally for that context. Return ONLY a JSON object with this structure: " +
                "{\"ipaUk\": \"string\", \"ipaUs\": \"string\", \"pos\": \"string\", \"level\": \"A1-C2\", " +
                "\"defEn\": \"string\", \"defVi\": \"string\", \"sentenceVi\": \"string\"}. " +
                "Rules: \n" +
                "1. ipaUk/ipaUs should be in IPA format.\n" +
                "2. defEn and defVi should be the one meaning that fits the context sentence.\n" +
                "3. sentenceVi should be a natural Vietnamese translation of the entire context sentence provided.\n" +
                "WORD: " + word + "\n" +
                "CONTEXT: " + sentence;

        Map<String, Object> requestBody = Map.of(
                "model", openAiModel,
                "temperature", 0.3,
                "response_format", Map.of("type", "json_object"),
                "messages", List.of(
                        Map.of("role", "system", "content",
                                "You are a helpful assistant that returns only valid JSON."),
                        Map.of("role", "user", "content", prompt)));

        try {
            String payload = objectMapper.writeValueAsString(requestBody);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.openai.com/v1/chat/completions"))
                    .timeout(Duration.ofSeconds(15))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + openAiApiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(payload))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new IOException("OpenAI Error: " + response.body());
            }

            JsonNode root = objectMapper.readTree(response.body());
            String content = root.path("choices").path(0).path("message").path("content").asText("");
            JsonNode aiJson = parseAiJson(content);

            if (aiJson == null) {
                throw new IOException("Failed to parse AI JSON");
            }

            return new AiOnlyResult(
                    trimToEmpty(aiJson.path("ipaUk").asText("")),
                    trimToEmpty(aiJson.path("ipaUs").asText("")),
                    trimToEmpty(aiJson.path("pos").asText("")),
                    trimToEmpty(aiJson.path("level").asText("")),
                    trimToEmpty(aiJson.path("defEn").asText("")),
                    trimToEmpty(aiJson.path("defVi").asText("")),
                    trimToEmpty(aiJson.path("sentenceVi").asText("")));
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI Lookup failed: " + ex.getMessage());
        }
    }

    private record AiOnlyResult(
            String ipaUk,
            String ipaUs,
            String partOfSpeech,
            String level,
            String definitionEn,
            String definitionVi,
            String contextTranslation) {
    }

    /**
     * 3. Lưu từ vựng người dùng vừa tra cứu vào "Sổ tay cá nhân".
     * Cho phép người dùng có thể ôn tập lại các từ này thông qua thuật toán sau khi
     * đọc xong.
     */
    @Transactional
    public void saveWordToPersonalVocabulary(SaveReadingWordRequest request) {
        if (request == null || request.userId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userId is required");
        }

        String normalizedWord = normalizeWord(request.word());
        if (normalizedWord.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "word is required");
        }

        User user = userRepository.findActiveById(request.userId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Kiểm tra xem từ này đã có trong sổ tay chưa để tránh trùng lặp
        if (userVocabularyCustomRepository.existsByUser_IdAndWordIgnoreCase(user.id, normalizedWord)) {
            return;
        }

        UserVocabularyCustom vocab = new UserVocabularyCustom();
        vocab.user = user;
        vocab.word = normalizedWord;
        vocab.pronunciation = truncate(trimToEmpty(request.pronunciation()), 100);
        vocab.partOfSpeech = truncate(trimToEmpty(request.partOfSpeech()), 50);
        vocab.meaningEn = trimToEmpty(request.meaningEn());
        vocab.meaningVi = trimToEmpty(request.meaningVi());
        vocab.example = trimToEmpty(request.example());
        vocab.exampleVi = trimToEmpty(request.exampleVi());
        vocab.createdAt = new Date();

        userVocabularyCustomService.save(vocab);
    }

    /**
     * Tự động lưu lại lịch sử các từ đã tra cứu.
     * Giúp hệ thống ghi nhận những từ vựng mà người dùng quan tâm trong mỗi bài
     * báo.
     */
    private void persistLookupHistorySilently(Long userId, Long articleId, ReadingWordLookupResponse response) {
        if (userId == null || response == null) {
            return;
        }

        try {
            Optional<User> userOptional = userRepository.findActiveById(userId);
            if (userOptional.isEmpty()) {
                return;
            }

            LookupHistory history = new LookupHistory();
            history.user = userOptional.get();
            history.article = articleId == null
                    ? null
                    : articleRepository.findById(articleId).orElse(null);
            history.word = truncate(response.normalizedWord(), 255);
            history.sentence = trimToEmpty(response.contextSentence());
            history.definitionsJson = serializeDefinitions(response.meanings());
            history.selectedIndex = response.selectedMeaningIndex() == null
                    ? null
                    : response.selectedMeaningIndex().longValue();
            history.meaningVi = selectedMeaningVi(response);
            history.createdAt = new Date();

            lookupHistoryRepository.save(history);
        } catch (Exception ignore) {
            // Không làm gián đoạn luồng tra từ nếu việc lưu lịch sử gặp lỗi
        }
    }

    private String selectedMeaningVi(ReadingWordLookupResponse response) {
        if (response.selectedMeaningIndex() == null || response.meanings() == null) {
            return "";
        }

        int index = response.selectedMeaningIndex();
        if (index < 0 || index >= response.meanings().size()) {
            return "";
        }

        ReadingWordLookupResponse.MeaningItem meaning = response.meanings().get(index);
        return meaning == null ? "" : trimToEmpty(meaning.definitionVi());
    }

    private String serializeDefinitions(List<ReadingWordLookupResponse.MeaningItem> meanings) {
        if (meanings == null || meanings.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(meanings);
        } catch (Exception ignore) {
            return null;
        }
    }

    /**
     * Cắt ngắn chuỗi văn bản nếu quá dài để tránh lỗi tràn bộ nhớ Database.
     */
    private String truncate(String value, int maxLength) {
        String text = trimToEmpty(value);
        if (text.length() <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength);
    }

    private JsonNode parseAiJson(String content) {
        String raw = trimToEmpty(content);
        if (raw.isBlank()) {
            return null;
        }

        try {
            return objectMapper.readTree(raw);
        } catch (Exception ignore) {
            Matcher matcher = JSON_BLOCK_PATTERN.matcher(raw);
            if (matcher.find()) {
                try {
                    return objectMapper.readTree(matcher.group());
                } catch (Exception ignored) {
                    return null;
                }
            }
            return null;
        }
    }

    /**
     * 5. Chuẩn hóa từ vựng (chuyển về chữ thường, xóa khoảng trắng).
     * Đảm bảo việc tra cứu đồng nhất, không bị phân biệt chữ hoa chữ thường.
     */
    private String normalizeWord(String value) {
        if (value == null) {
            return "";
        }

        String lower = value.trim().toLowerCase(Locale.ROOT);
        Matcher matcher = WORD_PATTERN.matcher(lower);
        if (!matcher.find()) {
            return "";
        }
        return matcher.group();
    }

    private String trimToEmpty(String value) {
        return value == null ? "" : value.trim();
    }
}
