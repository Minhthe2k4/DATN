package com.example.DATN.controller;

import com.example.DATN.dto.AdminReportsOverviewResponse;
import com.example.DATN.service.AdminReportsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/reports")
public class AdminReportsController {
    private final AdminReportsService adminReportsService;

    public AdminReportsController(AdminReportsService adminReportsService) {
        this.adminReportsService = adminReportsService;
    }

    @GetMapping("/overview")
    public AdminReportsOverviewResponse getOverview() {
        return adminReportsService.getOverview();
    }
}
