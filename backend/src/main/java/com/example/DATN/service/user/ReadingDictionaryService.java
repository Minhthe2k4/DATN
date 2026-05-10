package com.example.DATN.service.user;

import com.example.DATN.dto.user.ReadingWordLookupResponse;
import com.example.DATN.dto.user.SaveReadingWordRequest;
import com.example.DATN.entity.LookupHistory;
import com.example.DATN.entity.User;
import com.example.DATN.entity.UserVocabularyCustom;
import com.example.DATN.repository.content.ArticleRepository;
import com.example.DATN.repository.content.VideoRepository;
import com.example.DATN.repository.content.VocabularyRepository;
import com.example.DATN.repository.user.LookupHistoryRepository;
import com.example.DATN.repository.user.UserRepository;
import com.example.DATN.repository.learning.UserVocabularyCustomRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
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
    private final ObjectMapper objectMapper;
    private final UserRepository userRepository;
    private final ArticleRepository articleRepository;
    private final LookupHistoryRepository lookupHistoryRepository;
    private final UserVocabularyCustomRepository userVocabularyCustomRepository;
    private final UserVocabularyCustomService userVocabularyCustomService;
    private final AiDictionaryService aiDictionaryService;
    private final PremiumService premiumService;
    private final VocabularyRepository vocabularyRepository;
    private final VideoRepository videoRepository;

    public ReadingDictionaryService(
            UserRepository userRepository,
            ArticleRepository articleRepository,
            LookupHistoryRepository lookupHistoryRepository,
            UserVocabularyCustomRepository userVocabularyCustomRepository,
            UserVocabularyCustomService userVocabularyCustomService,
            AiDictionaryService aiDictionaryService,
            PremiumService premiumService,
            VocabularyRepository vocabularyRepository,
            VideoRepository videoRepository) {

        this.objectMapper = new ObjectMapper();
        this.userRepository = userRepository;
        this.articleRepository = articleRepository;
        this.lookupHistoryRepository = lookupHistoryRepository;
        this.userVocabularyCustomRepository = userVocabularyCustomRepository;
        this.userVocabularyCustomService = userVocabularyCustomService;
        this.aiDictionaryService = aiDictionaryService;
        this.premiumService = premiumService;
        this.vocabularyRepository = vocabularyRepository;
        this.videoRepository = videoRepository;
    }

    public ReadingWordLookupResponse lookupWord(String word, String contextSentence) {
        return lookupWord(word, contextSentence, null, null, null, false);
    }

    public ReadingWordLookupResponse lookupWord(String word, String contextSentence, Long userId, Long articleId) {
        return lookupWord(word, contextSentence, userId, articleId, null, false);
    }

    /**
     * 1. Chức năng tra cứu từ vựng thông minh trực tiếp khi đang đọc báo.
     * Điểm đặc biệt: Hệ thống gửi cả câu văn chứa từ đó lên AI để lấy nghĩa chính
     * xác nhất theo ngữ cảnh.
     */
    @Transactional
    public ReadingWordLookupResponse lookupWord(String word, String contextSentence, Long userId, Long articleId,
            Boolean forceRefresh) {
        return lookupWord(word, contextSentence, userId, articleId, null, forceRefresh);
    }

    @Transactional
    public ReadingWordLookupResponse lookupWord(String word, String contextSentence, Long userId, Long articleId,
            Long videoId, Boolean forceRefresh) {
        boolean skipCache = forceRefresh != null && forceRefresh;
        String normalizedWord = normalizeWord(word);
        if (normalizedWord.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Word is required");
        }

        String sentence = Optional.ofNullable(contextSentence)
                .map(String::trim)
                .orElse("");

        // CHẾ ĐỘ CHECK TRONG DB (TIẾT KIỆM TOKEN AI)
        if (!skipCache) {
            // 1. Check trong từ điển hệ thống (curated vocabulary)
            java.util.Optional<com.example.DATN.entity.Vocabulary> curated = vocabularyRepository
                    .findFirstByWordIgnoreCase(normalizedWord);
            if (curated.isPresent()) {
                com.example.DATN.entity.Vocabulary v = curated.get();
                List<ReadingWordLookupResponse.MeaningItem> items = new ArrayList<>();
                items.add(new ReadingWordLookupResponse.MeaningItem(
                        0,
                        v.typeOfWord,
                        v.meaningEn,
                        v.meaningVi,
                        sentence.isEmpty() ? v.example : sentence,
                        true));

                List<ReadingWordLookupResponse.PronunciationItem> prons = new ArrayList<>();
                if (v.pronunciation != null && !v.pronunciation.isBlank()) {
                    prons.add(new ReadingWordLookupResponse.PronunciationItem("IPA", v.pronunciation, ""));
                }

                return new ReadingWordLookupResponse(
                        v.word,
                        word == null ? normalizedWord : word.trim(),
                        v.level,
                        "System-Dictionary",
                        sentence,
                        false, // AI not used
                        0,
                        prons,
                        items,
                        "",
                        v.typeOfWord);
            }

            // 2. Check trong lịch sử tra cứu của hệ thống (Global Cache)
            java.util.Optional<LookupHistory> globalExisting = lookupHistoryRepository
                    .findTopByWordOrderByCreatedAtDesc(normalizedWord);
            if (globalExisting.isPresent()) {
                LookupHistory history = globalExisting.get();
                if (history.definitionsJson != null && !history.definitionsJson.isBlank()) {
                    try {
                        List<ReadingWordLookupResponse.MeaningItem> meanings = objectMapper.readValue(
                                history.definitionsJson,
                                objectMapper.getTypeFactory().constructCollectionType(List.class,
                                        ReadingWordLookupResponse.MeaningItem.class));

                        // Kiểm tra xem dữ liệu trong cache có "đủ tốt" không (có định nghĩa)
                        boolean isGoodData = meanings.stream()
                                .anyMatch(m -> m.definitionVi() != null && !m.definitionVi().isBlank());

                        if (isGoodData) {
                            return new ReadingWordLookupResponse(
                                    history.word,
                                    word == null ? normalizedWord : word.trim(),
                                    "",
                                    "Global-Cache",
                                    sentence.isEmpty() ? history.sentence : sentence,
                                    true,
                                    0,
                                    new ArrayList<>(),
                                    meanings,
                                    history.contextTranslation,
                                    "");
                        }
                    } catch (Exception ignore) {
                    }
                }
            }
        }

        // 3. Nếu không thấy hoặc buộc refresh mới gọi AI
        AiOnlyResult aiResult = lookupWithAiOnly(normalizedWord, sentence, userId);

        // VALIDATION & FALLBACK: Nếu AI trả về dữ liệu quá nghèo nàn
        if (aiResult.definitionVi.isBlank() && aiResult.definitionEn.isBlank()) {
            // Nếu có dịch ngữ cảnh, ta dùng nó làm định nghĩa tạm thời thay vì báo lỗi 500
            if (!aiResult.contextTranslation.isBlank()) {
                aiResult = new AiOnlyResult(
                        aiResult.rootWord,
                        aiResult.ipaUk,
                        aiResult.ipaUs,
                        aiResult.typeOfWord,
                        aiResult.level,
                        "Context-based definition",
                        "Nghĩa theo ngữ cảnh: " + aiResult.contextTranslation,
                        aiResult.contextTranslation);
            } else {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "AI không trả về đủ thông tin định nghĩa. Vui lòng thử lại.");
            }
        }

        List<ReadingWordLookupResponse.MeaningItem> meaningItems = new ArrayList<>();
        meaningItems.add(new ReadingWordLookupResponse.MeaningItem(
                0,
                aiResult.typeOfWord,
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
                aiResult.rootWord, // Hiển thị từ nguyên thể làm tiêu đề chính
                word == null ? normalizedWord : word.trim(), // Lưu lại từ gốc đã click
                aiResult.level,
                "AI-Generated",
                sentence,
                true,
                0,
                pronunciations,
                meaningItems,
                aiResult.contextTranslation,
                aiResult.typeOfWord);

        // Lưu lịch sử tra cứu thầm lặng (không làm gián đoạn việc đọc của người dùng)
        persistLookupHistorySilently(userId, articleId, videoId, response);
        return response;
    }

    /**
     * 2. Kết nối với Trí tuệ nhân tạo (OpenAI).
     * AI sẽ phân tích và trả về: Nghĩa từ, phiên âm IPA, cấp độ (A1-C2) và bản dịch
     * tiếng Việt của câu văn.
     */
    private AiOnlyResult lookupWithAiOnly(String word, String sentence, Long userId) {
        try {
            Map<String, String> data = aiDictionaryService.lookupWord(word, sentence, userId);
            return new AiOnlyResult(
                    data.get("word"),
                    data.get("phonetic"),
                    data.get("phonetic"),
                    data.get("typeOfWord"),
                    data.get("level"),
                    data.get("definitionEn"),
                    data.get("definitionVi"),
                    data.get("contextTranslation"));
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "AI Lookup failed: " + ex.getMessage());
        }
    }

    private record AiOnlyResult(
            String rootWord,
            String ipaUk,
            String ipaUs,
            String typeOfWord,
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
    public com.example.DATN.entity.UserVocabularyCustom saveWordToPersonalVocabulary(SaveReadingWordRequest request) {
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
        Optional<com.example.DATN.entity.UserVocabularyCustom> existing = userVocabularyCustomRepository
                .findByUser_IdAndWordIgnoreCase(user.id, normalizedWord);
        if (existing.isPresent()) {
            return existing.get();
        }

        UserVocabularyCustom vocab = new UserVocabularyCustom();
        vocab.user = user;
        vocab.word = normalizedWord;
        vocab.pronunciation = truncate(trimToEmpty(request.pronunciation()), 100);
        vocab.typeOfWord = truncate(trimToEmpty(request.typeOfWord()), 50);
        vocab.meaningEn = trimToEmpty(request.meaningEn());
        vocab.meaningVi = trimToEmpty(request.meaningVi());
        vocab.example = trimToEmpty(request.example());
        vocab.exampleVi = trimToEmpty(request.exampleVi());
        vocab.createdAt = new Date();

        // 4. Kiểm tra Premium - CHỈ khi thêm vào SRS
        boolean addToSRS = request.addToSRS() != null && request.addToSRS();
        if (addToSRS && vocab.user != null) {
            premiumService.checkAndIncrementActionLimit(vocab.user.id, "SAVED_VOCABULARY", "Lưu từ vựng");
        }

        return userVocabularyCustomService.save(vocab, addToSRS);
    }

    /**
     * Tự động lưu lại lịch sử các từ đã tra cứu.
     * Giúp hệ thống ghi nhận những từ vựng mà người dùng quan tâm trong mỗi bài
     * báo.
     */
    private void persistLookupHistorySilently(Long userId, Long articleId, Long videoId,
            ReadingWordLookupResponse response) {
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
            history.video = videoId == null
                    ? null
                    : videoRepository.findById(videoId).orElse(null);
            history.word = truncate(response.word(), 255);
            history.sentence = trimToEmpty(response.contextSentence());
            history.definitionsJson = serializeDefinitions(response.meanings());
            history.selectedIndex = response.selectedMeaningIndex() == null
                    ? null
                    : response.selectedMeaningIndex().longValue();
            history.meaningVi = selectedMeaningVi(response);
            history.contextTranslation = trimToEmpty(response.contextTranslation());
            history.createdAt = java.time.LocalDateTime.now();

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
