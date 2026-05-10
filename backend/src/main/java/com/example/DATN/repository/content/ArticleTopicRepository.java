package com.example.DATN.repository.content;

import com.example.DATN.entity.ArticleTopic;
import com.example.DATN.repository.projections.*;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

public interface ArticleTopicRepository extends JpaRepository<ArticleTopic, Long> {
        @Modifying
        @Transactional
        @Query(value = "DELETE FROM article_topics WHERE id = :id", nativeQuery = true)
        void hardDelete(Long id);

        @Modifying
        @Transactional
        @Query(value = "UPDATE article_topics SET deleted_at = NULL, status = false WHERE id = :id", nativeQuery = true)
        void restore(Long id);

        @Query("""
                        select t.id as id,
                               t.name as name,
                               t.description as description,
                               t.status as status,
                               t.articleTopicImage as articleTopicImage,
                               t.createdAt as createdAt,
                               t.updatedAt as updatedAt,
                               t.deletedAt as deletedAt,
                               count(a.id) as articleCount
                        from ArticleTopic t
                        left join Article a on a.topic.id = t.id
                            group by t.id, t.name, t.description, t.status, t.articleTopicImage, t.createdAt, t.updatedAt, t.deletedAt
                        order by t.id desc
                        """)
        List<ArticleTopicManagementProjection> findArticleTopicManagementRows();

        @Query(value = """
                        select t.id as id,
                               t.name as name,
                               t.description as description,
                               t.status as status,
                               t.article_topic_image as articleTopicImage,
                               t.created_at as createdAt,
                               t.updated_at as updatedAt,
                               t.deleted_at as deletedAt,
                               count(a.id) as articleCount
                        from article_topics t
                        left join articles a on a.topic_id = t.id
                        where t.deleted_at is not null
                        group by t.id, t.name, t.description, t.status, t.article_topic_image, t.created_at, t.updated_at, t.deleted_at
                        order by t.deleted_at desc
                        """, nativeQuery = true)
        List<ArticleTopicManagementProjection> findDeletedRows();

        @Query("""
                        select t.id as id,
                               t.name as name,
                               t.description as description,
                               t.articleTopicImage as articleTopicImage,
                               count(a.id) as articleCount
                        from ArticleTopic t
                        left join Article a
                            on a.topic.id = t.id
                                and lower(trim(coalesce(a.status, ''))) in ('đã xuất bản', 'da xuat ban', 'published')
                        where coalesce(t.status, false) = true
                        group by t.id, t.name, t.description, t.articleTopicImage
                        order by t.id desc
                        """)
        List<UserReadingTopicProjection> findActiveTopicsForUser();

        boolean existsByNameIgnoreCase(String name);

        boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
}
