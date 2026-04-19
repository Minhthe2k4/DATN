package com.example.DATN.repository;

import com.example.DATN.entity.ArticleTopic;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ArticleTopicRepository extends JpaRepository<ArticleTopic, Long> {
    @Query("""
            select t.id as id,
                   t.name as name,
                   t.description as description,
                   t.level as level,
                   t.status as status,
                   t.articleTopicImage as articleTopicImage,
                   count(a.id) as articleCount
            from ArticleTopic t
            left join Article a on a.topic.id = t.id
                group by t.id, t.name, t.description, t.level, t.status, t.articleTopicImage
            order by t.id desc
            """)
    List<ArticleTopicManagementProjection> findArticleTopicManagementRows();

    @Query("""
            select t.id as id,
                   t.name as name,
                   t.description as description,
                   t.level as level,
                   t.articleTopicImage as articleTopicImage,
                   count(a.id) as articleCount
            from ArticleTopic t
            left join Article a
                on a.topic.id = t.id
                    and lower(trim(coalesce(a.status, ''))) in ('đã xuất bản', 'da xuat ban', 'published')
            where coalesce(t.status, false) = true
            group by t.id, t.name, t.description, t.level, t.articleTopicImage
            order by t.id desc
            """)
    List<UserReadingTopicProjection> findActiveTopicsForUser();
}
