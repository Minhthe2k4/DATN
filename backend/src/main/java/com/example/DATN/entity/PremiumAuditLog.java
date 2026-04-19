package com.example.DATN.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.util.Date;

@Entity
@Table(name = "premium_audit_logs")
public class PremiumAuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    public Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    public User user;

    @ManyToOne
    @JoinColumn(name = "transaction_id")
    public Transaction transaction;

    @ManyToOne
    @JoinColumn(name = "subscription_id")
    public UserSubscription subscription;

    @Column(name = "action", length = 50)
    public String action;

    @Column(name = "status_before", length = 50)
    public String statusBefore;

    @Column(name = "status_after", length = 50)
    public String statusAfter;

    @Column(name = "reason", columnDefinition = "TEXT")
    public String reason;

    @Column(name = "admin_actor", length = 100)
    public String adminActor;

    @Column(name = "created_at")
    public Date createdAt;

    public PremiumAuditLog() {
    }
}
