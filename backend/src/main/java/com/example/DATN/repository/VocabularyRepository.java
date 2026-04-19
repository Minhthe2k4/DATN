package com.example.DATN.repository;

import com.example.DATN.entity.Vocabulary;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface VocabularyRepository extends JpaRepository<Vocabulary, Long> {
    long countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(LocalDateTime start, LocalDateTime end);

    @Query("""
            select v from Vocabulary v
            where v.id not in (
                select uvl.vocabulary.id from UserVocabularyLearning uvl
                where uvl.user.id = :userId and uvl.vocabulary is not null
            )
            order by v.id desc
            """)
    List<Vocabulary> findNewWordsForUser(@org.springframework.data.repository.query.Param("userId") Long userId, org.springframework.data.domain.Pageable pageable);

    @Query("""
            select v.id as id,
                   v.word as word,
                   v.pronunciation as pronunciation,
                   v.partOfSpeech as partOfSpeech,
                   v.meaningEn as meaningEn,
                   v.meaningVi as meaningVi,
                   v.example as example,
                   v.exampleVi as exampleVi,
                   v.level as level,
                     true as status,
                     null as lessonId,
                     null as topicId
            from Vocabulary v
                 group by v.id, v.word, v.pronunciation, v.partOfSpeech, v.meaningEn, v.meaningVi, v.example, v.exampleVi, v.level
            order by v.id desc
            """)
    List<VocabularyManagementProjection> findVocabularyManagementRows();
}
