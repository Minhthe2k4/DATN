package com.example.DATN.controller;

import com.example.DATN.dto.AdminDashboardOverviewResponse;
import com.example.DATN.service.AdminDashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {
    private final AdminDashboardService adminDashboardService;

    public AdminDashboardController(AdminDashboardService adminDashboardService) {
        this.adminDashboardService = adminDashboardService;
    }

    @GetMapping("/overview")
    public AdminDashboardOverviewResponse getOverview() {
        return adminDashboardService.getOverview();
    }
}
