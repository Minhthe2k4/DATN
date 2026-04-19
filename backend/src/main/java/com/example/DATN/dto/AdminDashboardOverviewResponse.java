package com.example.DATN.dto;

import java.util.List;

public record AdminDashboardOverviewResponse(
        List<StatCard> stats,
        List<MetricItem> dailyOperations,
        List<ModerationItem> moderationRows,
        List<PremiumRequestItem> premiumRequests,
        List<UserActivityLeaderItem> userActivityLeaders,
        List<String> governanceChecklist
) {
    public record StatCard(String label, String value, String meta, String icon) {
    }

    public record MetricItem(String label, String value, String hint) {
    }

    public record ModerationItem(String id, String type, String name, String state) {
    }

    public record PremiumRequestItem(String id, String email, String requestedAt, String packageName, String status) {
    }

    public record UserActivityLeaderItem(String id, String name, int streak, int learnedWords, int completion) {
    }
}
