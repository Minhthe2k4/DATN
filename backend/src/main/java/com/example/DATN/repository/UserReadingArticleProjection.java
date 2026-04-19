package com.example.DATN.repository;

/**
 * Projection interface for Reading articles (user view).
 * Moved to top-level to resolve ClassNotFoundException issues.
 */
public interface UserReadingArticleProjection {
    Long getId();

    String getTitle();

    String getContent();

    String getSource();

    java.util.Date getCreatedAt();

    String getDifficulty();

    Integer getWordsHighlighted();

    String getArticleImage();

    Long getTopicId();

    String getTopicName();

    String getTopicImage();
}
