package com.example.DATN.controller;

import com.example.DATN.dto.AdminSpacedConfigDto;
import com.example.DATN.dto.AdminSpacedConfigUpdateRequest;
import com.example.DATN.dto.AdminSpacedOverviewResponse;
import com.example.DATN.service.AdminSpacedRepetitionService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
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

    @PutMapping("/config")
    public AdminSpacedConfigDto updateConfig(@RequestBody AdminSpacedConfigUpdateRequest request) {
        return adminSpacedRepetitionService.updateConfig(request);
    }

    @PostMapping("/users/{userId}/reset")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resetUserData(@PathVariable Long userId) {
        adminSpacedRepetitionService.resetUserLearningData(userId);
    }
}
