package com.example.DATN.dto;

import com.example.DATN.entity.PremiumFeatureLimit;

public record FeatureLimitDto(
    String featureName,
    Boolean isLocked,
    Integer usageLimit
) {
    public static FeatureLimitDto fromEntity(PremiumFeatureLimit entity) {
        return new FeatureLimitDto(
            entity.getFeatureName(),
            entity.getIsLocked(),
            entity.getUsageLimit()
        );
    }
}
