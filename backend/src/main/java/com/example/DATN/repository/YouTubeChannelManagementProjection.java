package com.example.DATN.repository;

/**
 * Projection interface for YouTube channel management rows.
 */
public interface YouTubeChannelManagementProjection {
    Long getId();

    String getName();

    String getUrl();

    Long getVideoCount();
}
