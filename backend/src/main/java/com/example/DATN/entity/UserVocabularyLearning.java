package com.example.DATN.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "User_Vocabulary_Learning")
public class UserVocabularyLearning {
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

    @Column(name = "streak_correct")
    public Integer streakCorrect;

    @Column(name = "last_review")
    public Date lastReview;

    @Column(name = "next_review")
    public Date nextReview;

    @Column(name = "difficulty")
    public Double difficulty;

    @Column(name = "base_difficulty")
    public Double baseDifficulty;

    @Column(name = "total_attempts")
    public Integer totalAttempts;

    @Column(name = "total_errors")
    public Integer totalErrors;

    public UserVocabularyLearning() {
    }

    public Integer getDifficultyLevel() {
        if (difficulty == null)
            return 1;
        if (difficulty <= 1.2)
            return 6; // Mastered
        if (difficulty <= 1.7)
            return 5;
        if (difficulty <= 2.2)
            return 4;
        if (difficulty <= 2.7)
            return 3;
        if (difficulty <= 3.2)
            return 2;
        return 1; // New/Hard
    }
}
