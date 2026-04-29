package com.example.DATN.repository;

import com.example.DATN.entity.LookupHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LookupHistoryRepository extends JpaRepository<LookupHistory, Long> {
    java.util.Optional<LookupHistory> findTopByUserIdAndArticleIdAndWordOrderByCreatedAtDesc(Long userId, Long articleId, String word);

    java.util.Optional<LookupHistory> findTopByWordOrderByCreatedAtDesc(String word);
}
