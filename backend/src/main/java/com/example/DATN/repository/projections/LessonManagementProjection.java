package com.example.DATN.repository.projections;

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
    
    Integer getViews();

    Long getVocabCount();
    
    String getLessonImage();

    Boolean getIsPremium();
    
    java.util.Date getCreatedAt();
    java.util.Date getUpdatedAt();
}
