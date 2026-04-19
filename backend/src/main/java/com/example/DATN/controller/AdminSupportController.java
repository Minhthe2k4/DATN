package com.example.DATN.controller;

import com.example.DATN.dto.AdminSupportReplyRequest;
import com.example.DATN.dto.AdminSupportTicketDto;
import com.example.DATN.service.AdminSupportService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/support")
public class AdminSupportController {
    private final AdminSupportService adminSupportService;

    public AdminSupportController(AdminSupportService adminSupportService) {
        this.adminSupportService = adminSupportService;
    }

    @GetMapping("/tickets")
    public List<AdminSupportTicketDto> findTickets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) Integer limit
    ) {
        return adminSupportService.findTickets(status, email, limit);
    }

    @PatchMapping("/tickets/{ticketId}/status")
    public AdminSupportTicketDto updateStatus(
            @PathVariable Long ticketId,
            @RequestBody(required = false) AdminSupportReplyRequest request
    ) {
        return adminSupportService.updateStatus(ticketId, request == null ? null : request.status());
    }

    @PostMapping("/tickets/{ticketId}/reply")
    public AdminSupportTicketDto reply(
            @PathVariable Long ticketId,
            @RequestBody AdminSupportReplyRequest request
    ) {
        return adminSupportService.reply(ticketId, request);
    }
}
