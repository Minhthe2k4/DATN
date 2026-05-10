package com.example.DATN.repository.projections;

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
    
    String getDifficulty();
    
    String getDuration();
    
    Integer getWordsHighlighted();
    
    String getStatus();
    
    String getThumbnail();

    String getFilePath();

    String getSubtitleStatus();

    java.util.Date getCreatedAt();

    java.util.Date getUpdatedAt();

    java.util.Date getDeletedAt();
    Integer getViews();
}
