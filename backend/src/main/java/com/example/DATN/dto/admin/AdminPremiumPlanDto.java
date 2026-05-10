package com.example.DATN.dto.admin;

import java.util.List;

import com.example.DATN.dto.user.FeatureLimitDto;

/**
 * DTO for Premium Plan management in admin panel
 */
public record AdminPremiumPlanDto(
        Long id,
        String name,
        Double price,
        Integer durationDays,
        String description,
        List<FeatureLimitDto> limits) {
    public AdminPremiumPlanDto {
        // Record canonical constructor
    }
}
