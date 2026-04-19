package com.example.DATN.repository;

import com.example.DATN.entity.Lesson;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface LessonRepository extends JpaRepository<Lesson, Long> {
  @Query("select count(l) from Lesson l where l.description is null or trim(l.description) = ''")
    long countDraftLessons();

  @Query("select l from Lesson l where l.description is null or trim(l.description) = '' order by l.id desc")
    List<Lesson> findDraftLessons(Pageable pageable);

    @Query("""
            select l.id as id,
                   l.name as name,
                   l.description as description,
                   true as status,
                   t.id as topicId,
                   t.level as topicLevel,
                   0L as vocabCount
            from Lesson l
            left join l.topic t
                 group by l.id, l.name, l.description, t.id, t.level
            order by l.id desc
            """)
    List<LessonManagementProjection> findLessonManagementRows();
}
