package com.example.DATN.entity;

import jakarta.persistence.*;
import java.util.Date;
import org.hibernate.annotations.SQLRestriction;
@Entity
@Table(name = "vocabulary")
@SQLRestriction("deleted_at IS NULL")
public class Vocabulary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    public Long id;

    @Column(name = "word", unique = true, length = 100)
    public String word;

    @Column(name = "pronunciation", length = 100)
    public String pronunciation;

    @Column(name = "type_of_word", length = 50)
    public String typeOfWord;

    @Column(name = "meaning_en", columnDefinition = "TEXT")
    public String meaningEn;

    @Column(name = "meaning_vi", columnDefinition = "TEXT")
    public String meaningVi;

    @Column(name = "example", columnDefinition = "TEXT")
    public String example;

    @Column(name = "example_vi", columnDefinition = "TEXT")
    public String exampleVi;

    @Column(name = "level", length = 50)
    public String level;

    @Column(name = "status", length = 255)
    public String status;

    @Column(name = "created_at")
    public Date createdAt;

    @Column(name = "updated_at")
    public Date updatedAt;

    @Column(name = "deleted_at")
    public Date deletedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
        updatedAt = new Date();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = new Date();
    }

    public Vocabulary() {
    }
}
