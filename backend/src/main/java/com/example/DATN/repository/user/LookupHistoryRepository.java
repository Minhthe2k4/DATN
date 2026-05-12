package com.example.DATN.repository.user;

import com.example.DATN.entity.LookupHistory;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository quản lý lịch sử tra cứu của người dùng.
 * Kiêm vai trò "Global Cache" để lưu trữ các kết quả giải nghĩa từ AI.
 */
public interface LookupHistoryRepository extends JpaRepository<LookupHistory, Long> {
    java.util.Optional<LookupHistory> findTopByUserIdAndArticleIdAndWordOrderByCreatedAtDesc(Long userId, Long articleId, String word);

    // Truy vấn kết quả tra cứu gần nhất của một từ bất kỳ trong hệ thống
    // Phục vụ cơ chế Global Cache để tái sử dụng kết quả AI
    java.util.Optional<LookupHistory> findTopByWordOrderByCreatedAtDesc(String word);
}
