package com.example.DATN.repository.learning;

import com.example.DATN.entity.UserVocabularyCustom;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

/**
 * Repository quản lý sổ tay từ vựng cá nhân của người dùng.
 * Lưu trữ các từ vựng tự nhập, tra cứu từ bài báo hoặc video.
 */
public interface UserVocabularyCustomRepository extends JpaRepository<UserVocabularyCustom, Long> {
    // Kiểm tra xem từ đã tồn tại trong sổ tay của người dùng chưa
    boolean existsByUser_IdAndWordIgnoreCase(Long userId, String word);

    java.util.Optional<UserVocabularyCustom> findByUser_IdAndWordIgnoreCase(Long userId, String word);

    // Lấy toàn bộ danh sách từ vựng cá nhân của một người dùng
    List<UserVocabularyCustom> findByUser_IdOrderByCreatedAtDesc(Long userId);

    // Đếm số lượng từ đã lưu để kiểm tra hạn mức (Premium Limit)
    long countByUser_Id(Long userId);
}
