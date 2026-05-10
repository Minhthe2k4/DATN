package com.example.DATN.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "user_subscriptions")
public class UserSubscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    public User user;

    @ManyToOne
    @JoinColumn(name = "plan_id")
    public PremiumPlan plan;

    @Column(name = "start_date")
    public Date startDate;

    @Column(name = "end_date")
    public Date endDate;

    @Column(name = "status")
    public String status; // Ví dụ: 'ACTIVE', 'EXPIRED', 'CANCELLED'

    // Các trường bổ sung để quản lý hạn mức tra từ AI
    @Column(name = "is_premium")
    public Boolean isPremium = false;

    @Column(name = "daily_lookup_count")
    public Integer dailyLookupCount = 0;

    @Column(name = "last_lookup_date")
    public Date lastLookupDate;

    public UserSubscription() {}

    public UserSubscription(User user) {
        this.user = user;
        this.isPremium = false;
        this.dailyLookupCount = 0;
        this.lastLookupDate = new Date();
        this.startDate = new Date();
        this.status = "FREE";
    }
}
