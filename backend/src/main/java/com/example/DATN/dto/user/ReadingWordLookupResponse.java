package com.example.DATN.dto.user;

import java.util.List;

public record ReadingWordLookupResponse(
        String word,
        String normalizedWord,
        String level,
        String dictionarySource,
        String contextSentence,
        boolean aiUsed,
        Integer selectedMeaningIndex,
        List<PronunciationItem> pronunciations,
        List<MeaningItem> meanings,
        String contextTranslation,
        String typeOfWord
) {
    public record PronunciationItem(
            String label,
            String ipa,
            String audio
    ) {
    }

    public record MeaningItem(
            Integer index,
            String typeOfWord,
            String definitionEn,
            String definitionVi,
            String example,
            boolean contextMatch
    ) {
    }
}
