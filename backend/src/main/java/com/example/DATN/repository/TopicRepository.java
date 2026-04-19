package com.example.DATN.repository;

import com.example.DATN.entity.Topic;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface TopicRepository extends JpaRepository<Topic, Long> {
    long countByStatusFalse();

    List<Topic> findTop6ByStatusFalseOrderByIdDesc();

    @Query("""
            select t.id as id,
                   t.name as name,
                   t.description as description,
                   t.level as level,
                   t.status as status,
                   count(distinct l.id) as lessonCount,
                     0L as wordCount
            from Topic t
                 left join Lesson l on l.topic.id = t.id
            group by t.id, t.name, t.description, t.level, t.status
            order by t.id desc
            """)
    List<TopicManagementProjection> findTopicManagementRows();
}
