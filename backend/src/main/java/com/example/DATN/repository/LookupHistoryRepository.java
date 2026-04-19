package com.example.DATN.repository;

import com.example.DATN.entity.LookupHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LookupHistoryRepository extends JpaRepository<LookupHistory, Long> {
    // Có thể bổ sung các truy vấn custom nếu cần
}
