package com.example.DATN.repository.content;

import com.example.DATN.entity.Vocabulary;
import com.example.DATN.repository.projections.*;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

/**
 * Repository quản lý kho từ vựng hệ thống (System Vocabulary).
 * Chứa các từ vựng chính thống đã được biên soạn và kiểm duyệt.
 * Hỗ trợ các truy vấn quản lý vòng đời từ vựng và tra cứu thông tin phục vụ Admin.
 */
public interface VocabularyRepository extends JpaRepository<Vocabulary, Long> {
        /**
         * Xóa vĩnh viễn từ vựng khỏi Database.
         */
        @Modifying
        @Transactional
        @Query(value = "DELETE FROM vocabulary WHERE id = :id", nativeQuery = true)
        void hardDelete(Long id);

        /**
         * Khôi phục từ vựng đã bị xóa mềm và đặt trạng thái về 'Chờ duyệt'.
         */
        @Modifying
        @Transactional
        @Query(value = "UPDATE vocabulary SET deleted_at = NULL, status = 'Chờ duyệt' WHERE id = :id", nativeQuery = true)
        void restore(Long id);

        long countByStatus(String status);

        long countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(LocalDateTime start, LocalDateTime end);

        /**
         * Tìm các từ vựng mới mà người dùng chưa đưa vào lộ trình học tập.
         * Phục vụ Use Case: Khám phá từ vựng mới (UC_KhamPhaTuVung).
         */
        @Query("""
                        select v from Vocabulary v
                        where v.id not in (
                            select uvl.vocabulary.id from UserVocabularyLearning uvl
                            where uvl.user.id = :userId and uvl.vocabulary is not null
                        )
                        order by v.id desc
                        """)
        List<Vocabulary> findNewWordsForUser(@org.springframework.data.repository.query.Param("userId") Long userId,
                        org.springframework.data.domain.Pageable pageable);

        /**
         * Tra cứu nhanh từ vựng theo mặt chữ (không phân biệt hoa thường).
         * Dùng để kiểm tra sự tồn tại của từ trước khi thực hiện các tác vụ biên tập.
         */
        java.util.Optional<Vocabulary> findFirstByWordIgnoreCase(String word);

        boolean existsByWordIgnoreCase(String word);

        boolean existsByWordIgnoreCaseAndIdNot(String word, Long id);

        /**
         * Lấy danh sách từ vựng kèm theo thông tin quản lý.
         */
        @Query("""
                        select v.id as id,
                               v.word as word,
                               v.pronunciation as pronunciation,
                               v.typeOfWord as typeOfWord,
                               v.meaningEn as meaningEn,
                               v.meaningVi as meaningVi,
                               v.example as example,
                               v.exampleVi as exampleVi,
                               v.level as level,
                               v.status as status,
                               v.createdAt as createdAt,
                               v.updatedAt as updatedAt,
                               v.deletedAt as deletedAt,
                               null as lessonId,
                               null as topicId
                        from Vocabulary v
                        order by v.id desc
                        """)
        List<VocabularyManagementProjection> findVocabularyManagementRows();

        /**
         * Lấy danh sách từ vựng trong thùng rác (đã bị xóa mềm).
         */
        @Query(value = """
                        select v.id as id,
                               v.word as word,
                               v.pronunciation as pronunciation,
                               v.type_of_word as typeOfWord,
                               v.meaning_en as meaningEn,
                               v.meaning_vi as meaningVi,
                               v.example as example,
                               v.example_vi as exampleVi,
                               v.level as level,
                               v.status as status,
                               v.created_at as createdAt,
                               v.updated_at as updatedAt,
                               v.deleted_at as deletedAt,
                               null as lessonId,
                               null as topicId
                        from vocabulary v
                        where v.deleted_at is not null
                        order by v.deleted_at desc
                        """, nativeQuery = true)
        List<VocabularyManagementProjection> findDeletedRows();
}
