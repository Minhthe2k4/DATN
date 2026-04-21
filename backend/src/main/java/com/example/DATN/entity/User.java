package com.example.DATN.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "Users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    public Long id;

    @Column(name = "username", unique = true, length = 50)
    public String username;

    @Column(name = "email", unique = true, length = 100)
    public String email;

    @Column(name = "password", length = 255)
    public String password;

    @Column(name = "role", length = 20)
    public String role;

    @Column(name = "is_active")
    public Boolean isActive;

    @Column(name = "created_at")
    public Date createdAt;

    @Column(name = "deleted_at")
    public Date deletedAt;

    // No-arg constructor required by JPA
    public User() {}

    public Long getId() {
        return id;
    }
}

