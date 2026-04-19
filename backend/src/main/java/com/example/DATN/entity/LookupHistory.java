package com.example.DATN.entity;

import jakarta.persistence.*;
import java.util.Date;

// Lưu lịch sử tra cứu từ khi đọc báo (tính năng Reading)
@Entity
@Table(name = "lookup_history")
public class LookupHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    public Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    public User user;

    @Column(name = "word", length = 255, nullable = false)
    public String word;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "article_id")
    public Article article;

    @Column(name = "sentence", columnDefinition = "TEXT")
    public String sentence;

    @Column(name = "definitions_json", columnDefinition = "json")
    public String definitionsJson;

    @Column(name = "selected_index")
    public Long selectedIndex;

    @Column(name = "meaning_vi", columnDefinition = "TEXT")
    public String meaningVi;

    @Column(name = "created_at")
    @Temporal(TemporalType.TIMESTAMP)
    public Date createdAt;

    public LookupHistory() {}
}
