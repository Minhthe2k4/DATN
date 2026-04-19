package com.example.DATN.dto;

import java.util.List;

public record AdminSpacedOverviewResponse(
        SpacedStats stats,
        AdminSpacedConfigDto config,
        List<AdminSpacedResetCandidateDto> resetCandidates
) {
    public record SpacedStats(
            long dailyReviews,
            long wordsInReview,
            long scheduledReviews,
            long masteredWords
    ) {
    }
}
