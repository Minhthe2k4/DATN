package com.example.DATN.dto;

import java.util.List;

public record AdminReportsOverviewResponse(
        List<StatCard> stats,
        List<KpiItem> kpiOverview,
        List<TrendItem> trendSeries
) {
    public record StatCard(String label, String value, String meta, String icon) {
    }

    public record KpiItem(String label, String value, String hint) {
    }

    public record TrendItem(String label, long users, long words, long lessons, long reviews) {
    }
}
