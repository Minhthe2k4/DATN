package com.example.DATN.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "review_sessions")
public class ReviewSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    public Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    public User user;

    @Column(name = "total_questions")
    public Integer totalQuestions;

    @Column(name = "correct_answers")
    public Integer correctAnswers;

    @Column(name = "accuracy")
    public Double accuracy;

    @Column(name = "created_at")
    public Date createdAt;

    public ReviewSession() {}
}

