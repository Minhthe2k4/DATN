package com.example.DATN.repository.content;

import com.example.DATN.entity.Lesson;
import com.example.DATN.repository.projections.*;

import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

public interface LessonRepository extends JpaRepository<Lesson, Long> {
        @Modifying
        @Transactional
        @Query(value = "DELETE FROM lessons WHERE id = :id", nativeQuery = true)
        void hardDelete(Long id);

        @Modifying
        @Transactional
        @Query(value = "UPDATE lessons SET deleted_at = NULL, status = 'Tạm dừng' WHERE id = :id", nativeQuery = true)
        void restore(Long id);

        long countByStatus(String status);

        long countByIsPremium(Boolean isPremium);

        @Query("select avg(case when l.difficulty = 'Dễ' then 1.0 when l.difficulty = 'Trung bình' then 2.0 when l.difficulty = 'Khó' then 3.0 else 0.0 end) from Lesson l")
        Double calculateAverageDifficulty();

        @Query("select count(l) from Lesson l where l.description is null or trim(l.description) = ''")
        long countDraftLessons();

        boolean existsByNameIgnoreCase(String name);

        boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

        @Query("select l from Lesson l where l.description is null or trim(l.description) = '' order by l.id desc")
        List<Lesson> findDraftLessons(Pageable pageable);

        @Query("select count(l) from Lesson l where l.topic.id = :topicId")
        long countByTopicId(Long topicId);

        @Query("""
                        select l.id as id,
                               l.name as name,
                               l.description as description,
                               l.status as status,
                               l.difficulty as difficulty,
                               l.lessonImage as lessonImage,
                               l.isPremium as isPremium,
                               l.views as views,
                               l.createdAt as createdAt,
                               l.updatedAt as updatedAt,
                               t.id as topicId,
                               0L as vocabCount
                        from Lesson l
                        left join l.topic t
                        order by l.id desc
                        """)
        List<LessonManagementProjection> findLessonManagementRows();

        @Query(value = """
                        select l.id as id,
                               l.name as name,
                               l.description as description,
                               l.status as status,
                               l.difficulty as difficulty,
                               l.lesson_image as lessonImage,
                               l.is_premium as isPremium,
                               l.views as views,
                               l.created_at as createdAt,
                               l.updated_at as updatedAt,
                               l.topic_id as topicId,
                               0 as vocabCount
                        from lessons l
                        where l.deleted_at is not null
                        order by l.deleted_at desc
                        """, nativeQuery = true)
        List<LessonManagementProjection> findDeletedRows();
}
