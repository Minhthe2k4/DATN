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

    @Column(name = "created_at")
    public Date createdAt;

    public Transaction() {}
}

