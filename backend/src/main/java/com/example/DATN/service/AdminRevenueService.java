package com.example.DATN.service;

import com.example.DATN.dto.AdminRevenueOverviewResponse;
import com.example.DATN.repository.TransactionRepository;
import com.example.DATN.repository.UserRepository;
import com.example.DATN.repository.UserSubscriptionRepository;
import com.example.DATN.repository.RevenueTransactionProjection;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
public class AdminRevenueService {
    private static final Set<String> SUCCESS_STATUSES = Set.of("SUCCESS", "SUCCEEDED", "PAID", "APPROVED", "COMPLETED");
    private static final Set<String> REFUND_STATUSES = Set.of("REFUND", "REFUNDED", "CHARGEBACK");

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final UserSubscriptionRepository userSubscriptionRepository;

    public AdminRevenueService(
            TransactionRepository transactionRepository,
            UserRepository userRepository,
            UserSubscriptionRepository userSubscriptionRepository
    ) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.userSubscriptionRepository = userSubscriptionRepository;
    }

    public AdminRevenueOverviewResponse getOverview() {
        List<RevenueTransactionProjection> rows =
                transactionRepository.findRevenueRows(PageRequest.of(0, 1000));

        LocalDate now = LocalDate.now();
        YearMonth currentMonth = YearMonth.from(now);
        YearMonth previousMonth = currentMonth.minusMonths(1);

        double totalRevenueThisMonth = 0;
        double totalRevenueLastMonth = 0;
        double totalRefundThisMonth = 0;

        Map<String, PlanAccumulator> byPlan = new LinkedHashMap<>();
        Map<YearMonth, Double> monthRevenue = new LinkedHashMap<>();

        for (int i = 5; i >= 0; i--) {
            monthRevenue.put(currentMonth.minusMonths(i), 0.0);
        }

        for (RevenueTransactionProjection row : rows) {
            double amount = safeAmount(row.getAmount());
            String status = normalizeStatus(row.getStatus());
            String plan = normalizePlanName(row.getPlanName());

            Date createdAt = row.getCreatedAt();
            if (createdAt != null) {
                YearMonth rowMonth = YearMonth.from(createdAt.toInstant().atZone(ZoneId.systemDefault()).toLocalDate());
                if (rowMonth.equals(currentMonth) && isSuccessStatus(status)) {
                    totalRevenueThisMonth += amount;
                }
                if (rowMonth.equals(previousMonth) && isSuccessStatus(status)) {
                    totalRevenueLastMonth += amount;
                }
                if (rowMonth.equals(currentMonth) && isRefundStatus(status)) {
                    totalRefundThisMonth += amount;
                }
                if (monthRevenue.containsKey(rowMonth) && isSuccessStatus(status)) {
                    monthRevenue.compute(rowMonth, (key, value) -> value == null ? amount : value + amount);
                }
            }

            PlanAccumulator acc = byPlan.computeIfAbsent(plan, ignored -> new PlanAccumulator());
            if (isSuccessStatus(status)) {
                acc.gross += amount;
                acc.subscribers += 1;
            }
            if (isRefundStatus(status)) {
                acc.refunds += amount;
            }
        }

        long activePremiumUsers = userSubscriptionRepository.countDistinctActivePremiumUsers(java.time.LocalDateTime.now());
        long totalUsers = userRepository.count();

        double arpu = activePremiumUsers == 0 ? 0 : totalRevenueThisMonth / activePremiumUsers;
        int conversionRate = totalUsers == 0 ? 0 : (int) Math.round(activePremiumUsers * 100.0 / totalUsers);

        List<AdminRevenueOverviewResponse.RevenueByPlanItem> planItems = byPlan.entrySet().stream()
                .map(entry -> new AdminRevenueOverviewResponse.RevenueByPlanItem(
                        entry.getKey(),
                        entry.getValue().subscribers,
                        round2(entry.getValue().gross),
                        round2(entry.getValue().refunds),
                        round2(entry.getValue().gross - entry.getValue().refunds)
                ))
                .sorted(Comparator.comparingDouble(AdminRevenueOverviewResponse.RevenueByPlanItem::net).reversed())
                .toList();

        List<AdminRevenueOverviewResponse.RevenueTrendItem> trends = monthRevenue.entrySet().stream()
                .map(entry -> new AdminRevenueOverviewResponse.RevenueTrendItem(
                        "T" + entry.getKey().getMonthValue(),
                        round2(entry.getValue())
                ))
                .toList();

        List<AdminRevenueOverviewResponse.RevenueTransactionItem> transactions = rows.stream()
                .limit(20)
                .map(row -> new AdminRevenueOverviewResponse.RevenueTransactionItem(
                        row.getId(),
                        defaultString(row.getEmail(), "(không có email)"),
                        normalizePlanName(row.getPlanName()),
                        round2(safeAmount(row.getAmount())),
                        defaultString(row.getPaymentMethod(), "Không xác định"),
                        mapTransactionStatusLabel(row.getStatus()),
                        row.getCreatedAt()
                ))
                .collect(Collectors.toCollection(ArrayList::new));

        return new AdminRevenueOverviewResponse(
                new AdminRevenueOverviewResponse.RevenueSummary(
                        round2(totalRevenueThisMonth),
                        round2(totalRevenueLastMonth),
                        round2(totalRefundThisMonth),
                        round2(arpu),
                        conversionRate
                ),
                planItems,
                trends,
                transactions
        );
    }

    public List<AdminRevenueOverviewResponse.RevenueTransactionItem> findTransactions(
            String status,
            String email,
            LocalDate fromDate,
            LocalDate toDate,
            Integer limit
    ) {
        String normalizedStatus = normalizeStatus(defaultString(status, "ALL"));
        String normalizedEmail = defaultString(email, "").trim().toLowerCase(Locale.ROOT);
        LocalDateTime from = fromDate == null ? null : fromDate.atStartOfDay();
        LocalDateTime toExclusive = toDate == null ? null : toDate.plusDays(1).atStartOfDay();
        int pageSize = limit == null || limit <= 0 ? 100 : Math.min(limit, 500);

        return transactionRepository.findRevenueRows(PageRequest.of(0, pageSize * 4)).stream()
                .filter(row -> matchesStatusFilter(normalizedStatus, row.getStatus()))
                .filter(row -> normalizedEmail.isBlank() || defaultString(row.getEmail(), "").toLowerCase(Locale.ROOT).contains(normalizedEmail))
                .filter(row -> isWithinRange(row.getCreatedAt(), from, toExclusive))
                .limit(pageSize)
                .map(row -> new AdminRevenueOverviewResponse.RevenueTransactionItem(
                        row.getId(),
                        defaultString(row.getEmail(), "(không có email)"),
                        normalizePlanName(row.getPlanName()),
                        round2(safeAmount(row.getAmount())),
                        defaultString(row.getPaymentMethod(), "Không xác định"),
                        mapTransactionStatusLabel(row.getStatus()),
                        row.getCreatedAt()
                ))
                .toList();
    }

    private boolean isWithinRange(Date value, LocalDateTime from, LocalDateTime toExclusive) {
        if (value == null) {
            return from == null && toExclusive == null;
        }
        LocalDateTime point = value.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
        boolean afterFrom = from == null || !point.isBefore(from);
        boolean beforeTo = toExclusive == null || point.isBefore(toExclusive);
        return afterFrom && beforeTo;
    }

    private boolean matchesStatusFilter(String normalizedFilter, String status) {
        if (normalizedFilter.equals("ALL") || normalizedFilter.isBlank()) {
            return true;
        }
        String normalized = normalizeStatus(status);
        if (normalizedFilter.equals("SUCCESS")) {
            return isSuccessStatus(normalized);
        }
        if (normalizedFilter.equals("REFUND")) {
            return isRefundStatus(normalized);
        }
        if (normalizedFilter.equals("PENDING")) {
            return normalized.equals("PENDING") || normalized.equals("PROCESSING");
        }
        return normalized.equals(normalizedFilter);
    }

    private double safeAmount(Double amount) {
        return amount == null ? 0 : amount;
    }

    private String normalizeStatus(String status) {
        return defaultString(status, "").trim().toUpperCase(Locale.ROOT);
    }

    private boolean isSuccessStatus(String status) {
        return SUCCESS_STATUSES.contains(status);
    }

    private boolean isRefundStatus(String status) {
        return REFUND_STATUSES.contains(status);
    }

    private String mapTransactionStatusLabel(String status) {
        String normalized = normalizeStatus(status);
        if (isSuccessStatus(normalized)) {
            return "Thành công";
        }
        if (isRefundStatus(normalized)) {
            return "Hoàn tiền";
        }
        if (normalized.equals("PENDING") || normalized.equals("PROCESSING")) {
            return "Đang xử lý";
        }
        return defaultString(status, "Khác");
    }

    private String normalizePlanName(String planName) {
        String value = defaultString(planName, "Premium").trim();
        return value.isBlank() ? "Premium" : value;
    }

    private String defaultString(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value;
    }

    private double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private static final class PlanAccumulator {
        private long subscribers;
        private double gross;
        private double refunds;
    }
}
