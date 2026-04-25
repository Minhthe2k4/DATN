package com.example.DATN.service;

import com.example.DATN.entity.User;
import com.example.DATN.entity.UserVocabularyCustom;
import com.example.DATN.repository.UserRepository;
import com.example.DATN.repository.UserVocabularyCustomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class UserVocabularyCustomService {
    @Autowired
    private UserVocabularyCustomRepository userVocabularyCustomRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SpacedRepetitionService spacedRepetitionService;

    @Autowired
    private PremiumService premiumService;

    public UserVocabularyCustom save(UserVocabularyCustom vocab) {
        return save(vocab, true);
    }

    public UserVocabularyCustom save(UserVocabularyCustom vocab, boolean addToSRS) {
        // Kiểm tra quyền qua PremiumService - CHỈ khi thêm vào SRS
        if (addToSRS && vocab.user != null) {
            premiumService.checkAndIncrementActionLimit(vocab.user.id, "SAVED_VOCABULARY", "Lưu từ vựng");
        }

        if (vocab.createdAt == null) {
            vocab.createdAt = new Date();
        }
        vocab.updatedAt = new Date();
        UserVocabularyCustom saved = userVocabularyCustomRepository.save(vocab);

        // Initialize learning tracking - CHỈ khi yêu cầu
        if (addToSRS && saved.user != null) {
            spacedRepetitionService.initializeLearning(saved.user, saved);
        }

        return saved;
    }

    public UserVocabularyCustom update(Long id, UserVocabularyCustom vocabUpdates) {
        Optional<UserVocabularyCustom> existing = userVocabularyCustomRepository.findById(id);
        if (existing.isPresent()) {
            UserVocabularyCustom vocab = existing.get();
            if (vocabUpdates.word != null)
                vocab.word = vocabUpdates.word;
            if (vocabUpdates.pronunciation != null)
                vocab.pronunciation = vocabUpdates.pronunciation;
            if (vocabUpdates.partOfSpeech != null)
                vocab.partOfSpeech = vocabUpdates.partOfSpeech;
            if (vocabUpdates.meaningEn != null)
                vocab.meaningEn = vocabUpdates.meaningEn;
            if (vocabUpdates.meaningVi != null)
                vocab.meaningVi = vocabUpdates.meaningVi;
            if (vocabUpdates.example != null)
                vocab.example = vocabUpdates.example;
            if (vocabUpdates.exampleVi != null)
                vocab.exampleVi = vocabUpdates.exampleVi;
            if (vocabUpdates.level != null)
                vocab.level = vocabUpdates.level;
            if (vocabUpdates.levelSource != null)
                vocab.levelSource = vocabUpdates.levelSource;
            vocab.updatedAt = new Date();
            return userVocabularyCustomRepository.save(vocab);
        }
        return null;
    }

    public UserVocabularyCustom getById(Long id) {
        return userVocabularyCustomRepository.findById(id).orElse(null);
    }

    public List<UserVocabularyCustom> getUserCustomVocabularies(Long userId) {
        return userVocabularyCustomRepository.findByUser_IdOrderByCreatedAtDesc(userId);
    }

    public void delete(Long id) {
        userVocabularyCustomRepository.deleteById(id);
    }

    public boolean existsByUserIdAndWord(Long userId, String word) {
        return userVocabularyCustomRepository.existsByUser_IdAndWordIgnoreCase(userId, word);
    }

    public long countByUser_Id(Long userId) {
        return userVocabularyCustomRepository.countByUser_Id(userId);
    }

    public List<UserVocabularyCustom> saveMultiple(List<UserVocabularyCustom> vocabularies, Long userId,
            boolean addToSRS) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        // Kiểm tra quyền qua PremiumService (Hạn mức động từ Admin) - CHỈ khi thêm vào
        // SRS
        // Lưu ý: checkAndIncrementActionLimit sẽ ném lỗi FORBIDDEN nếu hết hạn hoặc bị
        // khóa
        if (addToSRS) {
            premiumService.checkAndIncrementActionLimit(userId, "SAVED_VOCABULARY", "Lưu từ vựng");
        }

        Date now = new Date();
        for (UserVocabularyCustom vocab : vocabularies) {
            vocab.user = user;
            if (vocab.createdAt == null) {
                vocab.createdAt = now;
            }
            vocab.updatedAt = now;
        }
        List<UserVocabularyCustom> savedList = userVocabularyCustomRepository.saveAll(vocabularies);

        // Initialize learning tracking if requested
        if (addToSRS) {
            for (UserVocabularyCustom saved : savedList) {
                spacedRepetitionService.initializeLearning(user, saved);
            }
        }

        return savedList;
    }
}
