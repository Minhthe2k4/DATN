package com.example.DATN.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "user_favorites")
public class UserFavorite {
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

    @Column(name = "created_at")
    public Date createdAt;

    public UserFavorite() {}

    public UserFavorite(User user, Long targetId, String targetType) {
        this.user = user;
        this.targetId = targetId;
        this.targetType = targetType;
        this.createdAt = new Date();
    }
}
