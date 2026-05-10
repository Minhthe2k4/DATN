package com.example.DATN.dto.admin;

import java.util.List;

import com.example.DATN.dto.user.FeatureLimitDto;

/**
 * DTO for creating/updating Premium Plans
 */
public record UpsertPremiumPlanRequest(
        String name,
        Double price,
        Integer durationDays,
        String description,
        List<FeatureLimitDto> limits) {
    public UpsertPremiumPlanRequest {
        // Record canonical constructor
    }
}
