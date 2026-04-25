package com.example.DATN.entity;

import jakarta.persistence.*;
import java.util.Date;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "topics")
@SQLDelete(sql = "UPDATE topics SET deleted_at = NOW() WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
public class Topic {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    public Long id;

    @Column(name = "name", length = 100)
    public String name;

    @Column(name = "description", columnDefinition = "TEXT")
    public String description;

    @Column(name = "level", length = 50)
    public String level;

    @Column(name = "status")
    public Boolean status;

    @Column(name = "topic_image", columnDefinition = "TEXT")
    public String topicImage;

    @Column(name = "created_at")
    public Date createdAt;

    @Column(name = "deleted_at")
    public Date deletedAt;

    public Topic() {
    }
}
