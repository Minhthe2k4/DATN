package com.example.DATN.repository;

/**
 * Projection interface for vocabulary management rows.
 */
public interface VocabularyManagementProjection {
    Long getId();

    String getWord();

    String getPronunciation();

    String getPartOfSpeech();

    String getMeaningEn();

    String getMeaningVi();

    String getExample();
    String getExampleVi();

    String getLevel();

    Boolean getStatus();

    Long getLessonId();

    Long getTopicId();
}
