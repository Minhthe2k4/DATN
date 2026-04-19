package com.example.DATN.repository;

/**
 * Projection interface for Lesson management rows.
 */
public interface LessonManagementProjection {
    Long getId();

    String getName();

    String getDescription();

    Boolean getStatus();

    Long getTopicId();

    String getTopicLevel();

    Long getVocabCount();
}
