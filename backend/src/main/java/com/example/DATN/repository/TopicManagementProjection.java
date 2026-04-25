package com.example.DATN.repository;

/**
 * Projection interface for Topic management rows.
 * Moved to top-level to resolve ClassNotFoundException issues.
 */
public interface TopicManagementProjection {
    Long getId();

    String getName();

    String getDescription();

    String getLevel();

    Boolean getStatus();

    Long getLessonCount();

    Long getWordCount();
    
    String getTopicImage();
}
