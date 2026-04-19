package com.example.DATN.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "support_tickets")
public class SupportTicket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    public Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    public User user;

    @Column(name = "title", length = 255)
    public String title;

    @Column(name = "message", columnDefinition = "TEXT")
    public String message;

    @Column(name = "status", length = 50)
    public String status;

    @Column(name = "created_at")
    public Date createdAt;

    public SupportTicket() {}
}

