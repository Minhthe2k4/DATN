package com.example.DATN.controller;

import com.example.DATN.dto.AdminPremiumPlanDto;
import com.example.DATN.service.AdminPremiumService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;

/**
 * Public-facing controller for Premium Plan and Feature information.
 * Handles requests from general users (non-admins).
 */
@RestController
@RequestMapping("/api/premium")
public class PremiumController {

    private final AdminPremiumService adminPremiumService;

    public PremiumController(AdminPremiumService adminPremiumService) {
        this.adminPremiumService = adminPremiumService;
    }

    /**
     * Get available subscription plans for users.
     */
    @GetMapping("/plans")
    public List<AdminPremiumPlanDto> getPlans() {
        return adminPremiumService.findAllPlans();
    }

    /**
     * Get premium features/benefits overview.
     */
    @GetMapping("/features")
    public List<String> getFeatures() {
        return Arrays.asList(
            "Học hơn 600 bộ từ vựng theo chủ đề",
            "Đọc hơn 1000 bài báo song ngữ",
            "Khám phá hơn 500 sách tiếng Anh",
            "Cập nhật nội dung mới liên tục",
            "Lưu từ và dịch đoạn văn không giới hạn",
            "Luyện tập với đầy đủ các dạng bài",
            "Sử dụng ngoại tuyến",
            "Gỡ quảng cáo",
            "Đồng bộ trên 3 thiết bị"
        );
    }
}
