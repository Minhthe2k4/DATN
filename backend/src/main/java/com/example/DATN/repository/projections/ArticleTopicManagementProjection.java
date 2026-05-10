package com.example.DATN.repository.projections;

/**
 * Projection interface for Article Topic management rows.
 */
public interface ArticleTopicManagementProjection {
    Long getId();

    String getName();

    String getDescription();

    Boolean getStatus();

    String getArticleTopicImage();

    Long getArticleCount();
    
    java.util.Date getCreatedAt();
    java.util.Date getUpdatedAt();
    java.util.Date getDeletedAt();
}
