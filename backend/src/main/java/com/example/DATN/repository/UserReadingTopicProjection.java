package com.example.DATN.repository;

/**
 * Projection interface for user reading topics.
 */
public interface UserReadingTopicProjection {
    Long getId();

    String getName();

    String getDescription();

    String getLevel();

    String getArticleTopicImage();

    Long getArticleCount();
}
