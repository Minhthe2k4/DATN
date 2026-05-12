package com.example.DATN.repository.content;

import com.example.DATN.entity.Topic;
import com.example.DATN.repository.projections.*;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

/**
 * Repository quản lý dữ liệu chủ đề (Topic).
 * Hỗ trợ các truy vấn tùy chỉnh để lấy dữ liệu thống kê và quản lý thùng rác.
 */
public interface TopicRepository extends JpaRepository<Topic, Long> {
        /**
         * Xóa vĩnh viễn chủ đề khỏi database (không sử dụng soft delete).
         */
        @Modifying
        @Transactional
        @Query(value = "DELETE FROM topics WHERE id = :id", nativeQuery = true)
        void hardDelete(Long id);

        /**
         * Khôi phục chủ đề đã bị xóa mềm.
         */
        @Modifying
        @Transactional
        @Query(value = "UPDATE topics SET deleted_at = NULL, status = false WHERE id = :id", nativeQuery = true)
        void restore(Long id);

        long countByStatus(Boolean status);

        boolean existsByNameIgnoreCase(String name);

        boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

        List<Topic> findTop6ByStatusFalseOrderByIdDesc();

        /**
         * Truy vấn danh sách chủ đề kèm theo số lượng bài học tương ứng.
         * Sử dụng Subquery để tính toán lessonCount nhằm giảm bớt số lượng request từ Frontend.
         */
        @Query("""
                        select t.id as id,
                               t.name as name,
                               t.description as description,
                               t.status as status,
                               t.topicImage as topicImage,
                               t.createdAt as createdAt,
                               t.updatedAt as updatedAt,
                               (select count(l.id) from Lesson l where l.topic.id = t.id) as lessonCount,
                               0L as wordCount
                        from Topic t
                        order by t.id desc
                        """)
        List<TopicManagementProjection> findTopicManagementRows();

        /**
         * Lấy danh sách các chủ đề đã bị xóa mềm (phục vụ chức năng thùng rác).
         */
        @Query(value = """
                        select t.id as id,
                               t.name as name,
                               t.description as description,
                               t.status as status,
                               t.topic_image as topicImage,
                               t.created_at as createdAt,
                               t.updated_at as updatedAt,
                               (select count(l.id) from lessons l where l.topic_id = t.id) as lessonCount,
                               0 as wordCount
                        from topics t
                        where t.deleted_at is not null
                        order by t.deleted_at desc
                        """, nativeQuery = true)
        List<TopicManagementProjection> findDeletedRows();
}
