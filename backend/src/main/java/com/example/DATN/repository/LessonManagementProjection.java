package com.example.DATN.repository;

/**
 * Projection interface for Lesson management rows.
 */
public interface LessonManagementProjection {
    Long getId();

    String getName();

    String getDescription();

    String getStatus();

    Long getTopicId();

    String getDifficulty();

    Long getVocabCount();
    
    String getLessonImage();

    Boolean getIsPremium();
}
