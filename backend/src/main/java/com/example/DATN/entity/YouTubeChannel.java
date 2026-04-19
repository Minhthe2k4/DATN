package com.example.DATN.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "youtube_channels")
public class YouTubeChannel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    public Long id;

    @Column(name = "name", length = 255)
    public String name;

    @Column(name = "url", length = 255)
    public String url;

    @Column(name = "description", columnDefinition = "TEXT")
    public String description;

    @Column(name = "subscriber_count")
    public Integer subscriberCount;

    @Column(name = "created_at")
    public Date createdAt;

    public YouTubeChannel() {}
}

