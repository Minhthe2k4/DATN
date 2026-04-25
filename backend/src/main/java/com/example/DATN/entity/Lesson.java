package com.example.DATN.entity;

import jakarta.persistence.*;
import java.util.Date;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "lessons")
@SQLDelete(sql = "UPDATE lessons SET deleted_at = NOW() WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
public class Lesson {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    public Long id;

    @ManyToOne
    @JoinColumn(name = "topic_id")
    public Topic topic;

    @Column(name = "name", length = 100)
    public String name;

    @Column(name = "description", columnDefinition = "TEXT")
    public String description;

    @Column(name = "difficulty", length = 255)
    public String difficulty;

    @Column(name = "status", length = 255)
    public String status;

    @Column(name = "lesson_image", columnDefinition = "TEXT")
    public String lessonImage;

    @Column(name = "is_premium")
    public Boolean isPremium = false;

    @Column(name = "deleted_at")
    public Date deletedAt;

    public Lesson() {
    }
}
