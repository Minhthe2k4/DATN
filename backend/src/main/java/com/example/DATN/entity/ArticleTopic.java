package com.example.DATN.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "article_topics")
public class ArticleTopic {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    public Long id;

    @Column(name = "name", length = 255)
    public String name;

    @Column(name = "description", columnDefinition = "TEXT")
    public String description;

    @Column(name = "level", length = 255)
    public String level;

    @Column(name = "status")
    public Boolean status;

    @Column(name = "article_topic_image", length = 45)
    public String articleTopicImage;

    public ArticleTopic() {}
}

