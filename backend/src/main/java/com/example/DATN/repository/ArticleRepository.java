package com.example.DATN.repository;

import com.example.DATN.entity.Article;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ArticleRepository extends JpaRepository<Article, Long> {
    @Query("select count(a) from Article a where a.source is null or trim(a.source) = ''")
    long countDraftArticles();

    @Query("select a from Article a where a.source is null or trim(a.source) = '' order by a.id desc")
    List<Article> findDraftArticles(Pageable pageable);

    @Query("""
            select a.id as id,
                   a.title as title,
                 a.content as content,
                   a.source as source,
                 a.createdAt as createdAt,
                 a.difficulty as difficulty,
                 a.wordsHighlighted as wordsHighlighted,
                 a.status as status,
                 a.articleImage as articleImage,
                   t.id as topicId,
                   t.name as topicName
            from Article a
            left join a.topic t
            order by a.id desc
            """)
    List<ArticleManagementProjection> findArticleManagementRows();

    @Query("""
            select a.id as id,
                   a.title as title,
                   a.content as content,
                   a.source as source,
                   a.createdAt as createdAt,
                   a.difficulty as difficulty,
                   a.wordsHighlighted as wordsHighlighted,
                   a.articleImage as articleImage,
                   t.id as topicId,
                   t.name as topicName,
                   t.articleTopicImage as topicImage
            from Article a
            join a.topic t
            where coalesce(t.status, false) = true
              and lower(trim(coalesce(a.status, ''))) in ('đã xuất bản', 'da xuat ban', 'published')
              and (:topicId is null or t.id = :topicId)
            order by a.createdAt desc, a.id desc
            """)
    List<UserReadingArticleProjection> findArticlesForUser(Long topicId);

    @Query("""
            select a.id as id,
                   a.title as title,
                   a.content as content,
                   a.source as source,
                   a.createdAt as createdAt,
                   a.difficulty as difficulty,
                   a.wordsHighlighted as wordsHighlighted,
                   a.articleImage as articleImage,
                   t.id as topicId,
                   t.name as topicName,
                   t.articleTopicImage as topicImage
            from Article a
            join a.topic t
            where a.id = :articleId
              and coalesce(t.status, false) = true
              and lower(trim(coalesce(a.status, ''))) in ('đã xuất bản', 'da xuat ban', 'published')
            """)
    UserReadingArticleProjection findArticleForUserById(Long articleId);
}
