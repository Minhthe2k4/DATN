package com.example.DATN.repository;

import com.example.DATN.entity.Article;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

public interface ArticleRepository extends JpaRepository<Article, Long> {
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM articles WHERE id = :id", nativeQuery = true)
    void hardDelete(Long id);

    @Modifying
    @Transactional
    @Query(value = "UPDATE articles SET deleted_at = NULL, status = 'Nháp' WHERE id = :id", nativeQuery = true)
    void restore(Long id);

    @Query("select count(a) from Article a where a.source is null or trim(a.source) = ''")
    long countDraftArticles();

    boolean existsByTitleIgnoreCase(String title);

    boolean existsByTitleIgnoreCaseAndIdNot(String title, Long id);

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
                   a.updatedAt as updatedAt,
                   a.deletedAt as deletedAt,
                   t.id as topicId,
                   t.name as topicName
            from Article a
            left join a.topic t
            order by a.id desc
            """)
    List<ArticleManagementProjection> findArticleManagementRows();

    @Query(value = """
            select a.id as id,
                   a.title as title,
                   a.content as content,
                   a.source as source,
                   a.created_at as createdAt,
                   a.difficulty as difficulty,
                   a.words_highlighted as wordsHighlighted,
                   a.status as status,
                   a.article_image as articleImage,
                   a.updated_at as updatedAt,
                   a.deleted_at as deletedAt,
                   t.id as topicId,
                   t.name as topicName
            from articles a
            left join article_topics t on t.id = a.topic_id
            where a.deleted_at is not null
            order by a.deleted_at desc
            """, nativeQuery = true)
    List<ArticleManagementProjection> findDeletedRows();

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
