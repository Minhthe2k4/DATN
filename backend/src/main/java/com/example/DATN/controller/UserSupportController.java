package com.example.DATN.controller;

import com.example.DATN.dto.CreateSupportTicketRequest;
import com.example.DATN.entity.SupportResponse;
import com.example.DATN.entity.SupportTicket;
import com.example.DATN.service.UserSupportService;
import com.example.DATN.util.AuthUtil;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user/support")
public class UserSupportController {
    @Autowired
    private UserSupportService userSupportService;



    /**
     * Create a new support ticket
     */
    @PostMapping("/tickets")
    public ResponseEntity<?> createTicket(
            @RequestBody CreateSupportTicketRequest request,
            HttpServletRequest httpRequest) {
        try {
            Long userId = AuthUtil.getUserId(httpRequest);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
            }

            SupportTicket ticket = userSupportService.createTicket(
                    userId,
                    request.email(),
                    request.name(),
                    request.topic(),
                    request.message()
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(ticket);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Get all support tickets for user
     */
    @GetMapping("/tickets")
    public ResponseEntity<?> getUserTickets(HttpServletRequest httpRequest) {
        try {
            Long userId = AuthUtil.getUserId(httpRequest);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
            }

            List<SupportTicket> tickets = userSupportService.getUserTickets(userId);
            return ResponseEntity.ok(tickets);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Get single ticket with details
     */
    @GetMapping("/tickets/{ticketId}")
    public ResponseEntity<?> getTicketById(
            @PathVariable Long ticketId,
            HttpServletRequest httpRequest) {
        try {
            Long userId = AuthUtil.getUserId(httpRequest);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
            }

            SupportTicket ticket = userSupportService.getTicketById(ticketId, userId);
            return ResponseEntity.ok(ticket);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Get all responses for a ticket
     */
    @GetMapping("/tickets/{ticketId}/responses")
    public ResponseEntity<?> getTicketResponses(
            @PathVariable Long ticketId,
            HttpServletRequest httpRequest) {
        try {
            Long userId = AuthUtil.getUserId(httpRequest);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
            }

            List<SupportResponse> responses = userSupportService.getTicketResponses(ticketId, userId);
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Close a support ticket
     */
    @PutMapping("/tickets/{ticketId}/close")
    public ResponseEntity<?> closeTicket(
            @PathVariable Long ticketId,
            HttpServletRequest httpRequest) {
        try {
            Long userId = AuthUtil.getUserId(httpRequest);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
            }

            SupportTicket ticket = userSupportService.closeTicket(ticketId, userId);
            return ResponseEntity.ok(ticket);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Reopen a support ticket
     */
    @PutMapping("/tickets/{ticketId}/reopen")
    public ResponseEntity<?> reopenTicket(
            @PathVariable Long ticketId,
            HttpServletRequest httpRequest) {
        try {
            Long userId = AuthUtil.getUserId(httpRequest);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
            }

            SupportTicket ticket = userSupportService.reopenTicket(ticketId, userId);
            return ResponseEntity.ok(ticket);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Add a reply to a support ticket
     */
    @PostMapping("/tickets/{ticketId}/reply")
    public ResponseEntity<?> addReply(
            @PathVariable Long ticketId,
            @RequestBody CreateSupportTicketRequest.ReplyRequest request,
            HttpServletRequest httpRequest) {
        try {
            Long userId = AuthUtil.getUserId(httpRequest);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
            }

            SupportResponse response = userSupportService.addTicketReply(
                    ticketId,
                    userId,
                    request.message()
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
