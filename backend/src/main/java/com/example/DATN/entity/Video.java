package com.example.DATN.entity;

import jakarta.persistence.*;
import java.util.Date;
import java.util.List;
import org.hibernate.annotations.SQLRestriction;
@Entity
@Table(name = "videos")
@SQLRestriction("deleted_at IS NULL")
public class Video {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    public Long id;

    @Column(name = "title", length = 255)
    public String title;

    @Column(name = "url", length = 255)
    public String url;

    // Đường dẫn file video được upload lên server
    @Column(name = "file_path", length = 500)
    public String filePath;

    @Column(name = "thumbnail", length = 500)
    public String thumbnail;

    // Trạng thái tạo phụ đề tự động: PENDING / PROCESSING / DONE / ERROR
    @Column(name = "subtitle_status", length = 50)
    public String subtitleStatus;

    @Column(name = "transcript", columnDefinition = "TEXT")
    public String transcript;

    @Column(name = "difficulty", length = 255)
    public String difficulty;

    @Column(name = "duration", length = 255)
    public String duration;

    @Column(name = "words_highlighted")
    public Integer wordsHighlighted;

    @Column(name = "status", length = 255)
    public String status;

    @Column(name = "views")
    public Integer views = 0;

    @Column(name = "created_at")
    public Date createdAt;

    @Column(name = "updated_at")
    public Date updatedAt;

    @Column(name = "deleted_at")
    public Date deletedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
        updatedAt = new Date();
        if (subtitleStatus == null) subtitleStatus = "PENDING";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = new Date();
    }

    @ManyToOne
    @JoinColumn(name = "channel_id")
    public YouTubeChannel channel;

    @OneToMany(mappedBy = "video", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<Segment> segments;

    public Video() {}
}
