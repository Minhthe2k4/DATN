package com.example.DATN.repository;

import java.time.LocalDateTime;

/**
 * Projection interface for pending premium requests.
 */
public interface PendingPremiumRequestProjection {
    Long getId();

    Long getUserId();

    Long getSubscriptionId();

    String getEmail();

    LocalDateTime getRequestedAt();

    String getPackageName();

    String getStatus();
}
