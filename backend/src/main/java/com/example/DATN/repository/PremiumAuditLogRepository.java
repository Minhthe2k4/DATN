package com.example.DATN.repository;

import com.example.DATN.entity.PremiumAuditLog;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface PremiumAuditLogRepository extends JpaRepository<PremiumAuditLog, Long> {
    @Query("""
            select log
            from PremiumAuditLog log
            order by log.createdAt desc, log.id desc
            """)
    List<PremiumAuditLog> findRecent(Pageable pageable);
}
