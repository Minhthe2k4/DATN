package com.example.DATN.service;

import com.example.DATN.entity.SupportResponse;
import com.example.DATN.entity.SupportTicket;
import com.example.DATN.entity.User;
import com.example.DATN.repository.SupportResponseRepository;
import com.example.DATN.repository.SupportTicketRepository;
import com.example.DATN.repository.UserRepository;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserSupportService {
    @Autowired
    private SupportTicketRepository supportTicketRepository;

    @Autowired
    private SupportResponseRepository supportResponseRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Create a new support ticket for user
     */
    public SupportTicket createTicket(Long userId, String title, String message) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }

        if (title == null || title.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title is required");
        }

        if (message == null || message.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message is required");
        }

        SupportTicket ticket = new SupportTicket();
        ticket.user = userOpt.get();
        ticket.title = title.trim();
        ticket.message = message.trim();
        ticket.status = "open";
        ticket.createdAt = new Date();

        return supportTicketRepository.save(ticket);
    }

    /**
     * Get all tickets for a user
     */
    public List<SupportTicket> getUserTickets(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }

        return supportTicketRepository.findAll().stream()
                .filter(ticket -> ticket.user != null && ticket.user.id.equals(userId))
                .toList();
    }

    /**
     * Get single ticket details with responses
     */
    public SupportTicket getTicketById(Long ticketId, Long userId) {
        Optional<SupportTicket> ticketOpt = supportTicketRepository.findById(ticketId.intValue());

        if (ticketOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found");
        }

        SupportTicket ticket = ticketOpt.get();

        // Verify user owns this ticket
        if (!ticket.user.id.equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        return ticket;
    }

    /**
     * Get responses for a ticket
     */
    public List<SupportResponse> getTicketResponses(Long ticketId, Long userId) {
        // First verify user owns the ticket
        Optional<SupportTicket> ticketOpt = supportTicketRepository.findById(ticketId.intValue());

        if (ticketOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found");
        }

        SupportTicket ticket = ticketOpt.get();

        if (!ticket.user.id.equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        return supportResponseRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
    }

    /**
     * Close a support ticket
     */
    public SupportTicket closeTicket(Long ticketId, Long userId) {
        Optional<SupportTicket> ticketOpt = supportTicketRepository.findById(ticketId.intValue());

        if (ticketOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found");
        }

        SupportTicket ticket = ticketOpt.get();

        if (!ticket.user.id.equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        ticket.status = "closed";
        return supportTicketRepository.save(ticket);
    }

    /**
     * Reopen a closed ticket
     */
    public SupportTicket reopenTicket(Long ticketId, Long userId) {
        Optional<SupportTicket> ticketOpt = supportTicketRepository.findById(ticketId.intValue());

        if (ticketOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found");
        }

        SupportTicket ticket = ticketOpt.get();

        if (!ticket.user.id.equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        ticket.status = "open";
        return supportTicketRepository.save(ticket);
    }

    /**
     * Add reply to support ticket (user replying to admin)
     */
    public SupportResponse addTicketReply(Long ticketId, Long userId, String message) {
        Optional<SupportTicket> ticketOpt = supportTicketRepository.findById(ticketId.intValue());

        if (ticketOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found");
        }

        SupportTicket ticket = ticketOpt.get();

        if (!ticket.user.id.equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        if (message == null || message.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message is required");
        }

        SupportResponse response = new SupportResponse();
        response.ticket = ticket;
        response.admin = null; // User response, not admin
        response.response = message.trim();

        return supportResponseRepository.save(response);
    }
}
