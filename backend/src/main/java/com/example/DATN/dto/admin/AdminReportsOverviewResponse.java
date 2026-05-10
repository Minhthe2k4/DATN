package com.example.DATN.dto.admin;

import java.util.List;

public record AdminReportsOverviewResponse(
        List<StatCard> stats,
        List<KpiItem> kpiOverview,
        List<TrendItem> trendSeries,
        StatsSummary summary
) {
    public record StatCard(String label, String value, String meta, String icon) {
    }

    public record KpiItem(String label, String value, String hint) {
    }

    public record TrendItem(String label, long users, long words, long lessons, long reviews) {
    }

    public record StatsSummary(
        long dailyReviews,
        long wordsInReview,
        long scheduledReviews,
        long masteredWords,
        int lessonCompletionRate,
        int averageAccuracyRate,
        long dailyWordsLearned
    ) {
    }
}
