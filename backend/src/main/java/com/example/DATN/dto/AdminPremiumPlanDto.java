package com.example.DATN.dto;

import java.util.List;

/**
 * DTO for Premium Plan management in admin panel
 */
public record AdminPremiumPlanDto(
    Long id,
    String name,
    Double price,
    Integer durationDays,
    String description,
    List<FeatureLimitDto> limits
) {
    public AdminPremiumPlanDto {
        // Record canonical constructor
    }
}
