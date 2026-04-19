package com.example.DATN.repository;

import com.example.DATN.entity.SupportResponse;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupportResponseRepository extends JpaRepository<SupportResponse, Long> {
    List<SupportResponse> findByTicketIdOrderByCreatedAtAsc(Long ticketId);
}
