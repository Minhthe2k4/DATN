package com.example.DATN.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "review_history")
public class ReviewHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    public Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    public User user;

    @ManyToOne
    @JoinColumn(name = "vocab_id")
    public Vocabulary vocabulary;

    @ManyToOne
    @JoinColumn(name = "custom_vocab_id")
    public UserVocabularyCustom customVocab;

    @Column(name = "is_correct")
    public Boolean isCorrect;

    @Column(name = "response_time")
    public Double responseTime;

    @Column(name = "created_at")
    public Date createdAt;

    public ReviewHistory() {}
}

