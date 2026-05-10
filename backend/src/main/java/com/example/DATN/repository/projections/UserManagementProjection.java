package com.example.DATN.repository.projections;

import java.util.Date;

/**
 * Projection interface for user management rows.
 */
public interface UserManagementProjection {
    Long getId();

    String getUsername();

    String getEmail();

    String getRole();

    Boolean getIsActive();

    Date getCreatedAt();

    String getFullName();

    Long getLearnedWords();

    Date getLastReviewAt();

    Integer getIsPremium();

    Date getPremiumUntil();

    String getAvatar();

    String getPhoneNumber();

    Date getUpdatedAt();

    Date getDeletedAt();
}
