package com.example.DATN.repository.projections;

/**
 * Projection interface for vocabulary management rows.
 */
public interface VocabularyManagementProjection {
    Long getId();

    String getWord();

    String getPronunciation();

    String getTypeOfWord();

    String getMeaningEn();

    String getMeaningVi();

    String getExample();
    String getExampleVi();

    String getLevel();

    String getStatus();

    Long getLessonId();

    Long getTopicId();
    
    java.util.Date getCreatedAt();
    java.util.Date getUpdatedAt();
    java.util.Date getDeletedAt();
}
