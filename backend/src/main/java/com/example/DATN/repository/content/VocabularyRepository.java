package com.example.DATN.repository.content;

import com.example.DATN.entity.Vocabulary;
import com.example.DATN.repository.projections.*;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

public interface VocabularyRepository extends JpaRepository<Vocabulary, Long> {
        @Modifying
        @Transactional
        @Query(value = "DELETE FROM vocabulary WHERE id = :id", nativeQuery = true)
        void hardDelete(Long id);

        @Modifying
        @Transactional
        @Query(value = "UPDATE vocabulary SET deleted_at = NULL, status = 'Chờ duyệt' WHERE id = :id", nativeQuery = true)
        void restore(Long id);

        long countByStatus(String status);

        long countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(LocalDateTime start, LocalDateTime end);

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

        java.util.Optional<Vocabulary> findFirstByWordIgnoreCase(String word);

        boolean existsByWordIgnoreCase(String word);

        boolean existsByWordIgnoreCaseAndIdNot(String word, Long id);

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
