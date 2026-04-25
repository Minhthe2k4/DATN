package com.example.DATN.repository;

import com.example.DATN.entity.UserVocabularyLearning;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserVocabularyLearningRepository extends JpaRepository<UserVocabularyLearning, Long> {
        long countByNextReviewLessThanEqual(java.util.Date time);

        long countByStreakCorrectGreaterThanEqual(Long streak);

        @Query("""
                        select u.id as userId,
                               u.email as email,
                               count(uvl.id) as wordsTracked,
                               coalesce(sum(coalesce(uvl.totalErrors, 0)), 0) as totalErrors,
                               coalesce(sum(coalesce(uvl.totalAttempts, 0)), 0) as totalAttempts,
                               coalesce(avg(coalesce(uvl.difficulty, 2.5)), 2.5) as avgDifficulty
                        from UserVocabularyLearning uvl
                        join uvl.user u
                        where u.deletedAt is null
                        group by u.id, u.email
                        order by coalesce(sum(coalesce(uvl.totalErrors, 0)), 0) desc, count(uvl.id) desc
                        """)
        List<ResetCandidateProjection> findResetCandidates(Pageable pageable);

        List<UserVocabularyLearning> findByUser_Id(@Param("userId") Long userId);

        @Query("""
                        select uvl
                        from UserVocabularyLearning uvl
                        where uvl.user.id = :userId and uvl.nextReview <= :now
                        order by uvl.nextReview asc
                        """)
        List<UserVocabularyLearning> findDueReviewsByUserId(@Param("userId") Long userId,
                        @Param("now") java.util.Date now);

        long countByUser_IdAndNextReviewLessThanEqual(Long userId, java.util.Date now);

        @Query("SELECT COUNT(uvl) FROM UserVocabularyLearning uvl WHERE uvl.user.id = :userId AND uvl.nextReview <= :now")
        long countDueReviewsByUserId(@Param("userId") Long userId, @Param("now") java.util.Date now);

        @Query("SELECT COUNT(uvl) FROM UserVocabularyLearning uvl WHERE uvl.nextReview >= :startDate AND uvl.nextReview < :endDate")
        long countByNextReviewGreaterThanEqualAndNextReviewLessThan(@Param("startDate") java.util.Date startDate,
                        @Param("endDate") java.util.Date endDate);

        boolean existsByUser_IdAndVocabulary_Id(Long userId, Long vocabId);

        boolean existsByUser_IdAndCustomVocab_Id(Long userId, Long customVocabId);

        long countByUser_Id(Long userId);
}
