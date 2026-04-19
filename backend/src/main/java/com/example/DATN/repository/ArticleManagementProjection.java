package com.example.DATN.repository;

/**
 * Projection interface for Article management rows.
 * Moved to top-level to resolve ClassNotFoundException issues.
 */
public interface ArticleManagementProjection {
    Long getId();

    String getTitle();

    String getContent();

    String getSource();

    java.util.Date getCreatedAt();

    String getDifficulty();

    Integer getWordsHighlighted();

    String getStatus();

    String getArticleImage();

    Long getTopicId();

    String getTopicName();
}
