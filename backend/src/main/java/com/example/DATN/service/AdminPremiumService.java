package com.example.DATN.service;

import com.example.DATN.dto.AdminPremiumAuditLogDto;
import com.example.DATN.dto.AdminPremiumMemberDto;
import com.example.DATN.dto.AdminPremiumRequestDto;
import com.example.DATN.dto.ManualPremiumGrantRequest;
import com.example.DATN.entity.Transaction;
import com.example.DATN.entity.PremiumAuditLog;
import com.example.DATN.entity.PremiumPlan;
import com.example.DATN.entity.User;
import com.example.DATN.entity.UserSubscription;
import com.example.DATN.repository.PremiumAuditLogRepository;
import com.example.DATN.repository.PremiumFeatureLimitRepository;
import com.example.DATN.repository.PremiumPlanRepository;
import com.example.DATN.repository.TransactionRepository;
import com.example.DATN.repository.UserRepository;
import com.example.DATN.repository.UserSubscriptionRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class AdminPremiumService {
    private static final Set<String> PENDING_STATUSES = Set.of("PENDING", "WAITING", "AWAITING", "PROCESSING", "REQUESTED", "CHỜ DUYỆT", "CHO DUYET");
    private static final Set<String> ACTIVE_STATUSES = Set.of("ACTIVE", "ACTIVATED", "PAID", "PREMIUM");
    private static final int DEFAULT_DURATION_DAYS = 30;

    private final TransactionRepository transactionRepository;
    private final UserSubscriptionRepository userSubscriptionRepository;
    private final UserRepository userRepository;
    private final PremiumPlanRepository premiumPlanRepository;
    private final PremiumAuditLogRepository premiumAuditLogRepository;
    private final PremiumFeatureLimitRepository premiumFeatureLimitRepository;

    public AdminPremiumService(
            TransactionRepository transactionRepository,
            UserSubscriptionRepository userSubscriptionRepository,
            UserRepository userRepository,
            PremiumPlanRepository premiumPlanRepository,
            PremiumAuditLogRepository premiumAuditLogRepository,
            PremiumFeatureLimitRepository premiumFeatureLimitRepository
    ) {
        this.transactionRepository = transactionRepository;
        this.userSubscriptionRepository = userSubscriptionRepository;
        this.userRepository = userRepository;
        this.premiumPlanRepository = premiumPlanRepository;
        this.premiumAuditLogRepository = premiumAuditLogRepository;
        this.premiumFeatureLimitRepository = premiumFeatureLimitRepository;
    }

    public List<AdminPremiumRequestDto> findRequests(String status, String email, LocalDate fromDate, LocalDate toDate) {
        String normalizedStatusFilter = normalizeStatusFilter(status);
        String normalizedEmail = defaultString(email, "").trim().toLowerCase(Locale.ROOT);
        LocalDateTime from = fromDate == null ? null : fromDate.atStartOfDay();
        LocalDateTime to = toDate == null ? null : toDate.plusDays(1).atStartOfDay();

        return transactionRepository.findAllRequestRows(PageRequest.of(0, 500)).stream()
                .filter(row -> matchesRequestStatus(normalizedStatusFilter, row.getStatus()))
                .filter(row -> normalizedEmail.isBlank() || defaultString(row.getEmail(), "").toLowerCase(Locale.ROOT).contains(normalizedEmail))
                .filter(row -> isWithinRange(row.getRequestedAt(), from, to))
                .map(row -> new AdminPremiumRequestDto(
                        row.getId(),
                        row.getUserId(),
                        row.getSubscriptionId(),
                        defaultString(row.getEmail(), "(không có email)"),
                        defaultString(row.getPackageName(), "Premium"),
                        row.getRequestedAt() == null ? null : java.sql.Timestamp.valueOf(row.getRequestedAt()),
                        mapRequestStatusLabel(row.getStatus())
                ))
                .toList();
    }

    public List<AdminPremiumMemberDto> findMembers(String status, String email, Integer expiringInDays) {
        String normalizedStatusFilter = normalizeStatusFilter(status);
        String normalizedEmail = defaultString(email, "").trim().toLowerCase(Locale.ROOT);
        Integer validExpiringInDays = expiringInDays != null && expiringInDays >= 0 ? expiringInDays : null;

        return userSubscriptionRepository.findLatestMembers().stream()
                .filter(row -> normalizedEmail.isBlank() || defaultString(row.getEmail(), "").toLowerCase(Locale.ROOT).contains(normalizedEmail))
                .filter(row -> matchesMemberStatus(normalizedStatusFilter, row.getStatus(), row.getEndDate()))
                .filter(row -> matchesExpiringFilter(row.getEndDate(), validExpiringInDays))
                .map(row -> new AdminPremiumMemberDto(
                        row.getSubscriptionId(),
                        row.getUserId(),
                        defaultString(row.getEmail(), "(không có email)"),
                        defaultString(row.getPlanName(), "Premium"),
                        row.getEndDate(),
                        mapMemberStatusLabel(row.getStatus(), row.getEndDate())
                ))
                .toList();
    }

    public List<AdminPremiumAuditLogDto> findAuditLogs(Integer limit) {
        int pageSize = limit == null || limit <= 0 ? 50 : Math.min(limit, 200);
        return premiumAuditLogRepository.findRecent(PageRequest.of(0, pageSize)).stream()
                .map(log -> new AdminPremiumAuditLogDto(
                        toLong(Math.toIntExact(log.id)),
                        log.user == null ? null : toLong(Math.toIntExact(log.user.id)),
                        log.user == null ? "" : defaultString(log.user.email, ""),
                        log.transaction == null ? null : toLong(Math.toIntExact(log.transaction.id)),
                        log.subscription == null ? null : toLong(Math.toIntExact(log.subscription.id)),
                        defaultString(log.action, ""),
                        defaultString(log.statusBefore, ""),
                        defaultString(log.statusAfter, ""),
                        defaultString(log.reason, ""),
                        defaultString(log.adminActor, ""),
                        log.createdAt
                ))
                .toList();
    }

    public void approveRequest(Long transactionId, String reason, String adminActor) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Premium request not found"));

        if (!isPendingStatus(transaction.status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request is not in pending state");
        }

        if (transaction.user == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request missing user information");
        }

        int durationDays = DEFAULT_DURATION_DAYS;
        if (transaction.subscription != null && transaction.subscription.plan != null && transaction.subscription.plan.duration != null) {
            durationDays = Math.max(1, transaction.subscription.plan.duration);
        }

        UserSubscription subscription = grantOrExtendSubscription(
                transaction.user,
                transaction.subscription == null ? null : transaction.subscription.plan,
                durationDays
        );

        String beforeStatus = defaultString(transaction.status, "");
        transaction.status = "APPROVED";
        transaction.subscription = subscription;
        transactionRepository.save(transaction);

        logAction(
                transaction.user,
                transaction,
                subscription,
                "APPROVE_REQUEST",
                beforeStatus,
                transaction.status,
                reason,
                adminActor
        );
    }

    public void rejectRequest(Long transactionId, String reason, String adminActor) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Premium request not found"));

        if (!isPendingStatus(transaction.status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request is not in pending state");
        }

        String beforeStatus = defaultString(transaction.status, "");
        transaction.status = "REJECTED";
        transactionRepository.save(transaction);

        logAction(
                transaction.user,
                transaction,
                transaction.subscription,
                "REJECT_REQUEST",
                beforeStatus,
                transaction.status,
                reason,
                adminActor
        );
    }

    public void cancelPremium(Long userId, String reason, String adminActor) {
        List<UserSubscription> subscriptions = userSubscriptionRepository.findActiveSubscriptionsByUserId(userId, new Date());
        if (subscriptions.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Active premium subscription not found");
        }

        Date now = new Date();
        subscriptions.forEach(subscription -> {
            String beforeStatus = defaultString(subscription.status, "");
            subscription.status = "CANCELED";
            subscription.endDate = now;
            logAction(
                    subscription.user,
                    null,
                    subscription,
                    "CANCEL_PREMIUM",
                    beforeStatus,
                    subscription.status,
                    reason,
                    adminActor
            );
        });
        userSubscriptionRepository.saveAll(subscriptions);
    }

    public void extendPremium(Long userId, Integer durationDays, String reason, String adminActor) {
        int extensionDays = durationDays == null || durationDays <= 0 ? DEFAULT_DURATION_DAYS : durationDays;

        List<UserSubscription> latestRows = userSubscriptionRepository.findLatestByUserId(userId);
        UserSubscription target = latestRows.stream().findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Premium subscription not found"));

        String beforeStatus = defaultString(target.status, "");
        Date now = new Date();
        Date baseline = target.endDate != null && target.endDate.after(now) ? target.endDate : now;
        target.status = "ACTIVE";
        target.endDate = addDays(baseline, extensionDays);
        if (target.startDate == null) {
            target.startDate = now;
        }
        userSubscriptionRepository.save(target);

        logAction(
                target.user,
                null,
                target,
                "EXTEND_PREMIUM",
                beforeStatus,
                target.status,
                defaultString(reason, "") + " (" + extensionDays + " days)",
                adminActor
        );
    }

    public void grantPremium(ManualPremiumGrantRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Grant request is required");
        }

        User user = resolveGrantTargetUser(request);
        PremiumPlan plan = null;
        if (request.planId() != null) {
            plan = premiumPlanRepository.findById(request.planId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Gói cước Premium không tồn tại"));
        }
        
        // Basic enforcement: New subscriptions MUST have a plan
        List<UserSubscription> activeSubs = userSubscriptionRepository.findActiveSubscriptionsByUserId(toLong(Math.toIntExact(user.id)), new Date());
        if (activeSubs.isEmpty() && plan == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cần chọn gói cước cụ thể khi cấp mới Premium cho người dùng này.");
        }

        int durationDays = request.durationDays() == null || request.durationDays() <= 0
                ? (plan != null && plan.duration != null ? plan.duration : DEFAULT_DURATION_DAYS)
                : request.durationDays();

        UserSubscription subscription = grantOrExtendSubscription(user, plan, durationDays);
        logAction(
                user,
                null,
                subscription,
                "MANUAL_GRANT",
                "",
                defaultString(subscription.status, ""),
                defaultString(request.reason(), "") + " (" + durationDays + " days)",
                request.adminActor()
        );
    }

    // ============= PLAN MANAGEMENT =============

    public List<com.example.DATN.dto.AdminPremiumPlanDto> findAllPlans() {
        return premiumPlanRepository.findAll().stream()
                .map(p -> new com.example.DATN.dto.AdminPremiumPlanDto(
                    p.id,
                    p.name,
                    p.price,
                    p.duration,
                    p.description,
                    p.getFeatureLimits() == null ? java.util.Collections.emptyList() :
                        p.getFeatureLimits().stream().map(com.example.DATN.dto.FeatureLimitDto::fromEntity).toList()
                ))
                .toList();
    }

    public com.example.DATN.dto.AdminPremiumPlanDto findPlanById(Long id) {
        PremiumPlan plan = premiumPlanRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Premium plan not found"));
        return new com.example.DATN.dto.AdminPremiumPlanDto(
            plan.id,
            plan.name,
            plan.price,
            plan.duration,
            plan.description,
            plan.getFeatureLimits() == null ? java.util.Collections.emptyList() :
                plan.getFeatureLimits().stream().map(com.example.DATN.dto.FeatureLimitDto::fromEntity).toList()
        );
    }

    public com.example.DATN.dto.AdminPremiumPlanDto createPlan(com.example.DATN.dto.UpsertPremiumPlanRequest request) {
        if (request.name() == null || request.name().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Plan name is required");
        }
        if (request.price() == null || request.price() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Plan price must be >= 0");
        }
        if (request.durationDays() == null || request.durationDays() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Duration must be > 0 days");
        }

        PremiumPlan plan = new PremiumPlan();
        plan.name = request.name().trim();
        plan.price = request.price();
        plan.duration = request.durationDays();
        plan.description = defaultString(request.description(), "").trim();
        
        final PremiumPlan saved = premiumPlanRepository.save(plan);
        
        if (request.limits() != null) {
            List<com.example.DATN.entity.PremiumFeatureLimit> entities = request.limits().stream()
                .map(l -> {
                    com.example.DATN.entity.PremiumFeatureLimit entity = new com.example.DATN.entity.PremiumFeatureLimit();
                    entity.setPlan(saved);
                    entity.setFeatureName(l.featureName());
                    entity.setIsLocked(l.isLocked());
                    entity.setUsageLimit(l.usageLimit());
                    return entity;
                }).toList();
            
            if (saved.getFeatureLimits() == null) {
                saved.setFeatureLimits(new ArrayList<>());
            }
            saved.getFeatureLimits().clear();
            saved.getFeatureLimits().addAll(entities);
            premiumFeatureLimitRepository.saveAll(entities);
        }

        return findPlanById(saved.id);
    }

    public com.example.DATN.dto.AdminPremiumPlanDto updatePlan(Long id, com.example.DATN.dto.UpsertPremiumPlanRequest request) {
        PremiumPlan plan = premiumPlanRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Premium plan not found"));

        if (request.name() != null && !request.name().isBlank()) {
            plan.name = request.name().trim();
        }
        if (request.price() != null) {
            if (request.price() < 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Plan price must be >= 0");
            }
            plan.price = request.price();
        }
        if (request.durationDays() != null) {
            if (request.durationDays() <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Duration must be > 0 days");
            }
            plan.duration = request.durationDays();
        }
        if (request.description() != null) {
            plan.description = request.description().trim();
        }

        if (request.limits() != null) {
            List<com.example.DATN.entity.PremiumFeatureLimit> entities = request.limits().stream()
                .map(l -> {
                    com.example.DATN.entity.PremiumFeatureLimit entity = new com.example.DATN.entity.PremiumFeatureLimit();
                    entity.setPlan(plan);
                    entity.setFeatureName(l.featureName());
                    entity.setIsLocked(l.isLocked());
                    entity.setUsageLimit(l.usageLimit());
                    return entity;
                }).toList();
            
            if (plan.getFeatureLimits() == null) {
                plan.setFeatureLimits(new ArrayList<>());
            }
            plan.getFeatureLimits().clear();
            plan.getFeatureLimits().addAll(entities);
            premiumFeatureLimitRepository.saveAll(entities);
        }

        PremiumPlan saved = premiumPlanRepository.save(plan);
        return findPlanById(saved.id);
    }

    public void deletePlan(Long id) {
        if (!premiumPlanRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Premium plan not found");
        }
        premiumPlanRepository.deleteById(id);
    }

    private UserSubscription grantOrExtendSubscription(User user, PremiumPlan plan, int durationDays) {
        Date now = new Date();
        List<UserSubscription> activeSubs = userSubscriptionRepository.findActiveSubscriptionsByUserId(toLong(Math.toIntExact(user.id)), now);
        UserSubscription target = activeSubs.stream().findFirst().orElse(null);

        if (target == null) {
            target = new UserSubscription();
            target.user = user;
            target.startDate = now;
        }

        if (plan != null) {
            target.plan = plan;
        }

        if (target.plan == null) {
            // This should have been caught in grantPremium, but as a safety for other callers
            throw new IllegalStateException("Không thể tạo hoặc gia hạn đăng ký mà không có Gói cước (Plan)");
        }

        Date baseline = target.endDate != null && target.endDate.after(now) ? target.endDate : now;
        target.status = "ACTIVE";
        target.endDate = addDays(baseline, Math.max(1, durationDays));
        return userSubscriptionRepository.save(target);
    }

    private User resolveGrantTargetUser(ManualPremiumGrantRequest request) {
        if (request.userId() != null) {
            return userRepository.findActiveById(request.userId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        }

        String email = defaultString(request.email(), "").trim();
        if (!email.isBlank()) {
            return userRepository.findActiveByEmail(email)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        }

        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userId or email is required");
    }

    private void logAction(
            User user,
            Transaction transaction,
            UserSubscription subscription,
            String action,
            String before,
            String after,
            String reason,
            String adminActor
    ) {
        PremiumAuditLog log = new PremiumAuditLog();
        log.user = user;
        log.transaction = transaction;
        log.subscription = subscription;
        log.action = action;
        log.statusBefore = before;
        log.statusAfter = after;
        log.reason = defaultString(reason, "").trim();
        log.adminActor = defaultString(adminActor, "system").trim();
        log.createdAt = new Date();
        premiumAuditLogRepository.save(log);
    }

    private Date addDays(Date date, int days) {
        return new Date(date.getTime() + (long) days * 24 * 60 * 60 * 1000);
    }

    private boolean matchesExpiringFilter(Date endDate, Integer expiringInDays) {
        if (expiringInDays == null) {
            return true;
        }
        if (endDate == null) {
            return false;
        }

        LocalDate today = LocalDate.now();
        LocalDate end = endDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        return !end.isBefore(today) && !end.isAfter(today.plusDays(expiringInDays));
    }

    private boolean matchesRequestStatus(String statusFilter, String status) {
        if (statusFilter.isBlank() || statusFilter.equals("ALL")) {
            return true;
        }

        String normalized = normalizeStatus(status);
        if (statusFilter.equals("PENDING")) {
            return PENDING_STATUSES.contains(normalized);
        }
        if (statusFilter.equals("APPROVED")) {
            return normalized.equals("APPROVED") || normalized.equals("SUCCESS") || normalized.equals("DONE");
        }
        if (statusFilter.equals("REJECTED")) {
            return normalized.equals("REJECTED") || normalized.equals("FAILED") || normalized.equals("DENIED");
        }

        return normalized.equals(statusFilter);
    }

    private boolean matchesMemberStatus(String statusFilter, String status, Date endDate) {
        if (statusFilter.isBlank() || statusFilter.equals("ALL")) {
            return true;
        }

        String normalized = normalizeStatus(status);
        if (statusFilter.equals("ACTIVE")) {
            return ACTIVE_STATUSES.contains(normalized) && !isExpired(endDate);
        }
        if (statusFilter.equals("EXPIRED")) {
            return isExpired(endDate);
        }
        if (statusFilter.equals("CANCELED")) {
            return normalized.equals("CANCELED") || normalized.equals("CANCELLED");
        }

        return normalized.equals(statusFilter);
    }

    private boolean isWithinRange(LocalDateTime value, LocalDateTime from, LocalDateTime to) {
        if (value == null) {
            return from == null && to == null;
        }
        boolean afterFrom = from == null || !value.isBefore(from);
        boolean beforeTo = to == null || value.isBefore(to);
        return afterFrom && beforeTo;
    }

    private boolean isExpired(Date endDate) {
        return endDate != null && endDate.before(new Date());
    }

    private boolean isPendingStatus(String status) {
        String normalized = normalizeStatus(status);
        return PENDING_STATUSES.contains(normalized);
    }

    private String mapRequestStatusLabel(String status) {
        String normalized = normalizeStatus(status);
        if (PENDING_STATUSES.contains(normalized)) {
            return "Chờ duyệt";
        }
        if (normalized.equals("APPROVED") || normalized.equals("SUCCESS") || normalized.equals("DONE")) {
            return "Đã duyệt";
        }
        if (normalized.equals("REJECTED") || normalized.equals("FAILED") || normalized.equals("DENIED")) {
            return "Từ chối";
        }
        return "Khác";
    }

    private String mapMemberStatusLabel(String status, Date endDate) {
        if (endDate != null && endDate.before(new Date())) {
            return "Hết hạn";
        }

        String normalized = normalizeStatus(status);
        if (normalized.equals("CANCELED") || normalized.equals("CANCELLED")) {
            return "Đã hủy";
        }

        return "Đang hoạt động";
    }

    private String normalizeStatusFilter(String status) {
        String normalized = normalizeStatus(status);
        if (normalized.equals("HOAT DONG") || normalized.equals("HOẠT ĐỘNG") || normalized.equals("ACTIVE")) {
            return "ACTIVE";
        }
        if (normalized.equals("CHO DUYET") || normalized.equals("CHỜ DUYỆT") || normalized.equals("PENDING")) {
            return "PENDING";
        }
        if (normalized.equals("TU CHOI") || normalized.equals("TỪ CHỐI") || normalized.equals("REJECTED")) {
            return "REJECTED";
        }
        if (normalized.equals("DA DUYET") || normalized.equals("ĐÃ DUYỆT") || normalized.equals("APPROVED")) {
            return "APPROVED";
        }
        if (normalized.equals("DA HUY") || normalized.equals("ĐÃ HỦY") || normalized.equals("CANCELED") || normalized.equals("CANCELLED")) {
            return "CANCELED";
        }
        if (normalized.equals("HET HAN") || normalized.equals("HẾT HẠN") || normalized.equals("EXPIRED")) {
            return "EXPIRED";
        }
        return normalized;
    }

    private String normalizeStatus(String status) {
        return defaultString(status, "").trim().toUpperCase(Locale.ROOT);
    }

    private String defaultString(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value;
    }

    private Long toLong(Integer value) {
        return value == null ? null : value.longValue();
    }
}
