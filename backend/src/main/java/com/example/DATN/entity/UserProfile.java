package com.example.DATN.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "user_profile")
public class UserProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    public Long id;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    public User user;

    @Column(name = "full_name", length = 100)
    public String fullName;

    @Column(name = "avatar", length = 255)
    public String avatar;

    public UserProfile() {}
}

