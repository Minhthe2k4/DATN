package com.example.DATN.dto;

import java.util.Date;
import java.util.List;

public record AdminRevenueOverviewResponse(
        RevenueSummary summary,
        List<RevenueByPlanItem> revenueByPlan,
        List<RevenueTrendItem> monthlyRevenueTrend,
        List<RevenueTransactionItem> transactions
) {
    public record RevenueSummary(
            double totalRevenueThisMonth,
            double totalRevenueLastMonth,
            double totalRefundThisMonth,
            double arpu,
            int conversionRate
    ) {
    }

    public record RevenueByPlanItem(
            String plan,
            long subscribers,
            double gross,
            double refunds,
            double net
    ) {
    }

    public record RevenueTrendItem(
            String label,
            double revenue
    ) {
    }

    public record RevenueTransactionItem(
            Long id,
            String email,
            String plan,
            double amount,
            String gateway,
            String status,
            Date createdAt
    ) {
    }
}
