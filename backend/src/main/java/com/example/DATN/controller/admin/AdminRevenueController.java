package com.example.DATN.controller.admin;

import com.example.DATN.dto.admin.AdminRevenueOverviewResponse;
import com.example.DATN.service.admin.AdminRevenueService;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

// Controller quản lý dữ liệu tài chính và doanh thu dành cho Admin.
@RestController
@RequestMapping("/api/admin/revenue")
public class AdminRevenueController {
    private final AdminRevenueService adminRevenueService;

    public AdminRevenueController(AdminRevenueService adminRevenueService) {
        this.adminRevenueService = adminRevenueService;
    }

    // Lấy thông tin tổng quan doanh thu (thống kê ngày, tháng, năm và theo gói).
    @GetMapping("/overview")
    public AdminRevenueOverviewResponse getOverview() {
        return adminRevenueService.getOverview();
    }

    // Tra cứu danh sách các giao dịch thanh toán kèm bộ lọc.
    @GetMapping("/transactions")
    public List<AdminRevenueOverviewResponse.RevenueTransactionItem> findTransactions(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Integer limit) {
        return adminRevenueService.findTransactions(status, email, fromDate, toDate, limit);
    }
}
