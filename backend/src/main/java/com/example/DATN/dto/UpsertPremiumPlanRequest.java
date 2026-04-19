package com.example.DATN.dto;

import java.util.List;

/**
 * DTO for creating/updating Premium Plans
 */
public record UpsertPremiumPlanRequest(
    String name,
    Double price,
    Integer durationDays,
    String description,
    List<FeatureLimitDto> limits
) {
    public UpsertPremiumPlanRequest {
        // Record canonical constructor
    }
}
