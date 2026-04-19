package com.example.DATN.repository;

/**
 * Projection interface for Article Topic management rows.
 */
public interface ArticleTopicManagementProjection {
    Long getId();

    String getName();

    String getDescription();

    String getLevel();

    Boolean getStatus();

    String getArticleTopicImage();

    Long getArticleCount();
}
