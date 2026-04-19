package com.example.DATN.controller;

import com.example.DATN.entity.LookupHistory;
import com.example.DATN.service.LookupHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user/lookup-history")
public class LookupHistoryController {
    @Autowired
    private LookupHistoryService lookupHistoryService;

    @PostMapping("/save")
    public LookupHistory saveLookupHistory(@RequestBody LookupHistory history) {
        // Có thể bổ sung xác thực user ở đây
        return lookupHistoryService.save(history);
    }
}
