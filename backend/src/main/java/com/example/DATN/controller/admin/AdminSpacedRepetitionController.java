package com.example.DATN.controller.admin;

import com.example.DATN.dto.admin.*;
import com.example.DATN.dto.admin.AdminSpacedOverviewResponse;
import com.example.DATN.service.admin.AdminSpacedRepetitionService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/spaced-repetition")
public class AdminSpacedRepetitionController {
    private final AdminSpacedRepetitionService adminSpacedRepetitionService;

    public AdminSpacedRepetitionController(AdminSpacedRepetitionService adminSpacedRepetitionService) {
        this.adminSpacedRepetitionService = adminSpacedRepetitionService;
    }

    @GetMapping("/overview")
    public AdminSpacedOverviewResponse getOverview() {
        return adminSpacedRepetitionService.getOverview();
    }

    @GetMapping("/learning-overview")
    public AdminReportsOverviewResponse getLearningOverview() {
        return adminSpacedRepetitionService.getLearningOverview();
    }
}
