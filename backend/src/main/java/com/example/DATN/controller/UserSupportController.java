package com.example.DATN.controller;

import com.example.DATN.dto.CreateSupportTicketRequest;
import com.example.DATN.entity.SupportResponse;
import com.example.DATN.entity.SupportTicket;
import com.example.DATN.service.UserSupportService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user/support")
public class UserSupportController {
    @Autowired
    private UserSupportService userSupportService;

    private Long getUserIdFromAuth(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }
        try {
            return Long.parseLong(auth.getName());
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Create a new support ticket
     */
    @PostMapping("/tickets")
    public ResponseEntity<?> createTicket(
            @RequestBody CreateSupportTicketRequest request,
            Authentication auth) {
        try {
            Long userId = getUserIdFromAuth(auth);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
            }

            SupportTicket ticket = userSupportService.createTicket(
                    userId,
                    null, // User is logged in, no guest email needed
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
    public ResponseEntity<?> getUserTickets(Authentication auth) {
        try {
            Long userId = getUserIdFromAuth(auth);
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
            Authentication auth) {
        try {
            Long userId = getUserIdFromAuth(auth);
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
            Authentication auth) {
        try {
            Long userId = getUserIdFromAuth(auth);
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
            Authentication auth) {
        try {
            Long userId = getUserIdFromAuth(auth);
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
            Authentication auth) {
        try {
            Long userId = getUserIdFromAuth(auth);
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
            Authentication auth) {
        try {
            Long userId = getUserIdFromAuth(auth);
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
