package com.example.DATN.repository;

import java.util.Date;

/**
 * Projection interface for revenue transaction rows.
 */
public interface RevenueTransactionProjection {
    Long getId();

    String getEmail();

    String getPlanName();

    Double getAmount();

    String getPaymentMethod();

    String getStatus();

    Date getCreatedAt();
}
