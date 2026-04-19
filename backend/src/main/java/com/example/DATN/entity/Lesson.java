package com.example.DATN.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "lessons")
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

    @Column(name = "status")
    public Integer status;

    @Column(name = "lesson_image", length = 45)
    public String lessonImage;

    public Lesson() {
    }
}
