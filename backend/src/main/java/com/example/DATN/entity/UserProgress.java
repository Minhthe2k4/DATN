package com.example.DATN.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "user_progress")
public class UserProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    public User user;

    @Column(name = "target_id")
    public Long targetId;

    @Column(name = "target_type") // ARTICLE or VIDEO
    public String targetType;

    @Column(name = "progress_percent")
    public Double progressPercent;

    @Column(name = "updated_at")
    public Date updatedAt;

    public UserProgress() {}

    public UserProgress(User user, Long targetId, String targetType, Double progressPercent) {
        this.user = user;
        this.targetId = targetId;
        this.targetType = targetType;
        this.progressPercent = progressPercent;
        this.updatedAt = new Date();
    }
}
