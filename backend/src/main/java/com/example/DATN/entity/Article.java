package com.example.DATN.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "articles")
public class Article {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    public Long id;

    @Column(name = "title", length = 255)
    public String title;

    @Column(name = "content", columnDefinition = "TEXT")
    public String content;

    @Column(name = "source", length = 255)
    public String source;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id")
    public ArticleTopic topic;

    @Column(name = "created_at")
    public Date createdAt;

    @Column(name = "difficulty", length = 255)
    public String difficulty;

    @Column(name = "words_highlighted", nullable = true)
    public Integer wordsHighlighted = 0;

    @Column(name = "status", length = 255)
    public String status;

    @Column(name = "article_image", length = 45)
    public String articleImage;

    public Article() {}
}

