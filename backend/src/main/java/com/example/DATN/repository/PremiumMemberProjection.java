package com.example.DATN.repository;

import java.util.Date;

/**
 * Projection interface for premium member rows.
 */
public interface PremiumMemberProjection {
    Long getSubscriptionId();

    Long getUserId();

    String getEmail();

    String getPlanName();

    Date getStartDate();

    Date getEndDate();

    String getStatus();
}
