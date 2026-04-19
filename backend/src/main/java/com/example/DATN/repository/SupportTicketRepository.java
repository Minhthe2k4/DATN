package com.example.DATN.repository;

import com.example.DATN.entity.SupportTicket;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SupportTicketRepository extends JpaRepository<SupportTicket, Integer> {
    @Query("""
            select st
            from SupportTicket st
            left join fetch st.user u
            where (:status is null or upper(coalesce(st.status, '')) = :status)
              and (:email = '' or lower(coalesce(u.email, '')) like concat('%', :email, '%'))
            order by st.createdAt desc
            """)
    List<SupportTicket> findAdminTickets(
            @Param("status") String status,
            @Param("email") String email,
            Pageable pageable
    );
}
