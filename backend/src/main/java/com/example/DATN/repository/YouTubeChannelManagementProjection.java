package com.example.DATN.repository;

/**
 * Projection interface for YouTube channel management rows.
 */
public interface YouTubeChannelManagementProjection {
    Long getId();

    String getName();

    String getUrl();

    Long getVideoCount();
    
    String getDescription();
    
    String getStatus();
    
    String getAvatar();

    String getHandle();

    Long getSubscriberCount();

    java.util.Date getCreatedAt();

    java.util.Date getUpdatedAt();

    java.util.Date getDeletedAt();
}
