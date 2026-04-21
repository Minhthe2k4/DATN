package com.example.DATN.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "transactions")
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    public Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    public User user;

    @ManyToOne
    @JoinColumn(name = "subscription_id")
    public UserSubscription subscription;

    @Column(name = "amount")
    public Double amount;

    @Column(name = "payment_method", length = 50)
    public String paymentMethod;

    @Column(name = "status", length = 50)
    public String status;

    @Column(name = "vnp_txn_ref", length = 100)
    public String paymentTransId;

    @ManyToOne
    @JoinColumn(name = "plan_id")
    public PremiumPlan plan;

    @Column(name = "created_at")
    public Date createdAt;

    public Transaction() {
        this.createdAt = new Date();
    }
}

