package com.example.DATN.repository.learning;

import com.example.DATN.repository.projections.*;
import com.example.DATN.entity.UserVocabularyLearning;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

// Ôn tập thời điểm vàng (SRS).
//Quản lý lịch ôn tập (nextReview) và các chỉ số ghi nhớ (streakCorrect, difficulty)
//cho từng cặp User-Vocabulary.

public interface UserVocabularyLearningRepository extends JpaRepository<UserVocabularyLearning, Long> {

        // Lấy danh sách từ vựng đã đến hạn hoặc quá hạn ôn tập (nextReview <= now).
        // Phục vụ chức năng bài kiểm tra ôn tập hàng ngày.
        @Query("""
                        select uvl
                        from UserVocabularyLearning uvl
                        where uvl.user.id = :userId and uvl.nextReview <= :now
                        order by uvl.nextReview asc
                        """)
        List<UserVocabularyLearning> findDueReviewsByUserId(@Param("userId") Long userId,
                        @Param("now") java.util.Date now);

        long countByNextReviewLessThanEqual(java.util.Date time);

        long countByStreakCorrectGreaterThanEqual(Long streak);


        List<UserVocabularyLearning> findByUser_Id(@Param("userId") Long userId);

        long countByUser_IdAndNextReviewLessThanEqual(Long userId, java.util.Date now);

        @Query("SELECT COUNT(uvl) FROM UserVocabularyLearning uvl WHERE uvl.user.id = :userId AND uvl.nextReview <= :now")
        long countDueReviewsByUserId(@Param("userId") Long userId, @Param("now") java.util.Date now);

        @Query("SELECT COUNT(uvl) FROM UserVocabularyLearning uvl WHERE uvl.nextReview >= :startDate AND uvl.nextReview < :endDate")
        long countByNextReviewGreaterThanEqualAndNextReviewLessThan(@Param("startDate") java.util.Date startDate,
                        @Param("endDate") java.util.Date endDate);

        boolean existsByUser_IdAndVocabulary_Id(Long userId, Long vocabId);

        boolean existsByUser_IdAndCustomVocab_Id(Long userId, Long customVocabId);

        @Query("SELECT COUNT(uvl) FROM UserVocabularyLearning uvl WHERE uvl.lastReview >= :start AND uvl.lastReview < :end AND uvl.difficulty <= 1.3")
        long countMasteredInRange(@Param("start") java.util.Date start, @Param("end") java.util.Date end);

        long countByUser_Id(Long userId);
}
