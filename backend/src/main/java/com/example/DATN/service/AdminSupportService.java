package com.example.DATN.service;

import com.example.DATN.dto.AdminSupportReplyRequest;
import com.example.DATN.dto.AdminSupportResponseDto;
import com.example.DATN.dto.AdminSupportTicketDto;
import com.example.DATN.entity.SupportResponse;
import com.example.DATN.entity.SupportTicket;
import com.example.DATN.entity.User;
import com.example.DATN.repository.SupportResponseRepository;
import com.example.DATN.repository.SupportTicketRepository;
import com.example.DATN.repository.UserRepository;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminSupportService {
    private final SupportTicketRepository supportTicketRepository;
    private final SupportResponseRepository supportResponseRepository;
    private final UserRepository userRepository;

    public AdminSupportService(
            SupportTicketRepository supportTicketRepository,
            SupportResponseRepository supportResponseRepository,
            UserRepository userRepository
    ) {
        this.supportTicketRepository = supportTicketRepository;
        this.supportResponseRepository = supportResponseRepository;
        this.userRepository = userRepository;
    }

    public List<AdminSupportTicketDto> findTickets(String status, String email, Integer limit) {
        String normalizedStatus = normalizeStatusFilter(status);
        String normalizedEmail = defaultString(email, "").trim().toLowerCase(Locale.ROOT);
        int pageSize = limit == null || limit <= 0 ? 200 : Math.min(limit, 500);

        return supportTicketRepository.findAdminTickets(
                        normalizedStatus,
                        normalizedEmail,
                        PageRequest.of(0, pageSize)
                ).stream()
                .map(this::toTicketDto)
                .toList();
    }

    public AdminSupportTicketDto updateStatus(Long ticketId, String status) {
        SupportTicket ticket = supportTicketRepository.findById(toInteger(ticketId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));

        ticket.status = mapStatus(defaultString(status, ""));
        supportTicketRepository.save(ticket);
        return toTicketDto(ticket);
    }

    public AdminSupportTicketDto reply(Long ticketId, AdminSupportReplyRequest request, Long currentAdminId) {
        SupportTicket ticket = supportTicketRepository.findById(toInteger(ticketId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));

        String content = defaultString(request == null ? null : request.response(), "").trim();
        if (content.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Response is required");
        }

        User admin = resolveAdmin(request, currentAdminId);

        SupportResponse response = new SupportResponse();
        response.ticket = ticket;
        response.admin = admin;
        response.response = content;
        supportResponseRepository.save(response);

        String nextStatus = request == null ? null : request.status();
        ticket.status = nextStatus == null || nextStatus.isBlank() ? "Đã giải quyết" : mapStatus(nextStatus);
        supportTicketRepository.save(ticket);

        return toTicketDto(ticket);
    }

    private AdminSupportTicketDto toTicketDto(SupportTicket ticket) {
        List<AdminSupportResponseDto> responses = supportResponseRepository
            .findByTicketIdOrderByCreatedAtAsc(ticket.id)
                .stream()
                .map(response -> new AdminSupportResponseDto(
                        response.id,
                        response.admin == null ? null : toLong(Math.toIntExact(response.admin.id)),
                        response.admin == null ? "system" : defaultString(response.admin.email, "system"),
                        defaultString(response.response, ""),
                        response.createdAt
                ))
                .toList();

        return new AdminSupportTicketDto(
                toLong(Math.toIntExact(ticket.id)),
                ticket.user == null ? null : toLong(Math.toIntExact(ticket.user.id)),
                ticket.user == null ? "Người dùng" : defaultString(ticket.user.username, "Người dùng"),
                ticket.user == null ? "(không có email)" : defaultString(ticket.user.email, "(không có email)"),
                defaultString(ticket.title, "Hỗ trợ"),
                defaultString(ticket.message, ""),
                mapStatus(defaultString(ticket.status, "Chờ xử lý")),
                ticket.createdAt == null ? new Date() : ticket.createdAt,
                responses
        );
    }

    private User resolveAdmin(AdminSupportReplyRequest request, Long currentAdminId) {
        // 1. Try explicit ID from request
        if (request != null && request.adminId() != null) {
            Optional<User> opt = userRepository.findActiveById(request.adminId());
            if (opt.isPresent()) return opt.get();
        }

        // 2. Try explicit email from request
        if (request != null && request.adminEmail() != null && !request.adminEmail().isBlank()) {
            Optional<User> opt = userRepository.findActiveByEmail(request.adminEmail());
            if (opt.isPresent()) return opt.get();
        }

        // 3. Fallback to authenticated admin ID
        if (currentAdminId != null) {
            return userRepository.findById(currentAdminId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Authenticated Admin not found"));
        }

        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Admin not found and no authenticated user provided");
    }

    private String normalizeStatusFilter(String status) {
        String normalized = defaultString(status, "").trim().toUpperCase(Locale.ROOT);
        if (normalized.isBlank() || normalized.equals("ALL") || normalized.equals("TẤT CẢ") || normalized.equals("TAT CA")) {
            return null;
        }
        return mapStatus(normalized).toUpperCase(Locale.ROOT);
    }

    private String mapStatus(String status) {
        String normalized = defaultString(status, "").trim().toUpperCase(Locale.ROOT);
        if (normalized.equals("PENDING") || normalized.equals("CHỜ XỬ LÝ") || normalized.equals("CHO XU LY")) {
            return "Chờ xử lý";
        }
        if (normalized.equals("IN_PROGRESS") || normalized.equals("ĐANG XỬ LÝ") || normalized.equals("DANG XU LY")) {
            return "Đang xử lý";
        }
        if (normalized.equals("RESOLVED") || normalized.equals("DONE") || normalized.equals("ĐÃ GIẢI QUYẾT") || normalized.equals("DA GIAI QUYET")) {
            return "Đã giải quyết";
        }
        return defaultString(status, "Chờ xử lý");
    }

    private Long toLong(Integer value) {
        return value == null ? null : value.longValue();
    }

    private Integer toInteger(Long value) {
        if (value == null) {
            return null;
        }
        if (value > Integer.MAX_VALUE || value < Integer.MIN_VALUE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ticket id is out of range");
        }
        return value.intValue();
    }

    private String defaultString(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value;
    }
}
