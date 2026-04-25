package com.example.DATN.entity;

import jakarta.persistence.*;
import java.util.Date;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "youtube_channels")
@SQLDelete(sql = "UPDATE youtube_channels SET deleted_at = NOW() WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
public class YouTubeChannel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    public Long id;

    @Column(name = "name", length = 255)
    public String name;

    @Column(name = "url", length = 255)
    public String url;

    @Column(name = "handle", length = 255)
    public String handle;

    @Column(name = "description", columnDefinition = "TEXT")
    public String description;

    @Column(name = "subscriber_count")
    public Integer subscriberCount;

    @Column(name = "status", length = 255)
    public String status;

    @Column(name = "created_at")
    public Date createdAt;

    @Column(name = "deleted_at")
    public Date deletedAt;

    public YouTubeChannel() {}
}
