package com.example.DATN.entity;

import jakarta.persistence.*;
import java.util.Date;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "article_topics")
@SQLDelete(sql = "UPDATE article_topics SET deleted_at = NOW() WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
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

    @Column(name = "article_topic_image", columnDefinition = "TEXT")
    public String articleTopicImage;

    @Column(name = "deleted_at")
    public Date deletedAt;

    public ArticleTopic() {}
}
