package com.example.DATN.controller;

import com.example.DATN.dto.AdminPremiumAuditLogDto;
import com.example.DATN.dto.AdminPremiumMemberDto;
import com.example.DATN.dto.AdminPremiumPlanDto;
import com.example.DATN.dto.AdminPremiumRequestDto;
import com.example.DATN.dto.ManualPremiumExtendRequest;
import com.example.DATN.dto.ManualPremiumGrantRequest;
import com.example.DATN.dto.PremiumActionRequest;
import com.example.DATN.dto.UpsertPremiumPlanRequest;
import com.example.DATN.service.AdminPremiumService;
import java.time.LocalDate;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/premium")
public class AdminPremiumController {
    private final AdminPremiumService adminPremiumService;

    public AdminPremiumController(AdminPremiumService adminPremiumService) {
        this.adminPremiumService = adminPremiumService;
    }

    @GetMapping("/requests")
    public List<AdminPremiumRequestDto> findRequests(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate
    ) {
        return adminPremiumService.findRequests(status, email, fromDate, toDate);
    }

    @GetMapping("/members")
    public List<AdminPremiumMemberDto> findMembers(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) Integer expiringInDays
    ) {
        return adminPremiumService.findMembers(status, email, expiringInDays);
    }

    @GetMapping("/audit-logs")
    public List<AdminPremiumAuditLogDto> findAuditLogs(
            @RequestParam(required = false) Integer limit
    ) {
        return adminPremiumService.findAuditLogs(limit);
    }

    @PostMapping("/requests/{transactionId}/approve")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void approveRequest(
            @PathVariable Long transactionId,
            @RequestBody(required = false) PremiumActionRequest request
    ) {
        adminPremiumService.approveRequest(
                transactionId,
                request == null ? null : request.reason(),
                request == null ? null : request.adminActor()
        );
    }

    @PostMapping("/requests/{transactionId}/reject")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void rejectRequest(
            @PathVariable Long transactionId,
            @RequestBody(required = false) PremiumActionRequest request
    ) {
        adminPremiumService.rejectRequest(
                transactionId,
                request == null ? null : request.reason(),
                request == null ? null : request.adminActor()
        );
    }

    @PostMapping("/members/{userId}/cancel")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancelPremium(
            @PathVariable Long userId,
            @RequestBody(required = false) PremiumActionRequest request
    ) {
        adminPremiumService.cancelPremium(
                userId,
                request == null ? null : request.reason(),
                request == null ? null : request.adminActor()
        );
    }

    @PostMapping("/members/{userId}/extend")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void extendPremium(
            @PathVariable Long userId,
            @RequestBody(required = false) ManualPremiumExtendRequest request
    ) {
        adminPremiumService.extendPremium(
                userId,
                request == null ? null : request.durationDays(),
                request == null ? null : request.reason(),
                request == null ? null : request.adminActor()
        );
    }

    @PostMapping("/grant")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void grantPremium(@RequestBody ManualPremiumGrantRequest request) {
        adminPremiumService.grantPremium(request);
    }

    // ============= PLAN MANAGEMENT =============

    @GetMapping("/plans")
    public List<AdminPremiumPlanDto> findAllPlans() {
        return adminPremiumService.findAllPlans();
    }

    @GetMapping("/plans/{id}")
    public AdminPremiumPlanDto findPlanById(@PathVariable Long id) {
        return adminPremiumService.findPlanById(id);
    }

    @PostMapping("/plans")
    public AdminPremiumPlanDto createPlan(@RequestBody UpsertPremiumPlanRequest request) {
        return adminPremiumService.createPlan(request);
    }

    @PutMapping("/plans/{id}")
    public AdminPremiumPlanDto updatePlan(@PathVariable Long id, @RequestBody UpsertPremiumPlanRequest request) {
        return adminPremiumService.updatePlan(id, request);
    }

    @DeleteMapping("/plans/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePlan(@PathVariable Long id) {
        adminPremiumService.deletePlan(id);
    }
}
