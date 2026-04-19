package com.example.DATN.repository;

import com.example.DATN.entity.LessonVocabulary;
import com.example.DATN.entity.LessonVocabularyId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LessonVocabularyRepository extends JpaRepository<LessonVocabulary, LessonVocabularyId> {
    @Query("SELECT lv.vocabId FROM LessonVocabulary lv WHERE lv.lessonId = :lessonId")
    List<Long> findVocabIdsByLessonId(@Param("lessonId") Long lessonId);

    @Query("SELECT COUNT(lv) FROM LessonVocabulary lv WHERE lv.lessonId = :lessonId")
    long countByLessonId(@Param("lessonId") Long lessonId);
}
