package com.example.DATN.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "leaderboard")
public class Leaderboard {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    public Long id;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    public User user;

    @Column(name = "score")
    public Integer score;

    @Column(name = "rank")
    public Integer rank;

    public Leaderboard() {}
}

