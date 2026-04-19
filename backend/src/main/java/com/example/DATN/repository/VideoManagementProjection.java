package com.example.DATN.repository;

/**
 * Projection interface for video management rows.
 */
public interface VideoManagementProjection {
    Long getId();

    String getTitle();

    String getUrl();

    Long getChannelId();

    String getChannelName();

    Long getTopicId();
}
