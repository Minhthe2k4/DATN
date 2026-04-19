package com.example.DATN.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "videos")
public class Video {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    public Long id;

    @Column(name = "title", length = 255)
    public String title;

    @Column(name = "url", length = 255)
    public String url;

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

    @ManyToOne
    @JoinColumn(name = "channel_id")
    public YouTubeChannel channel;

    @OneToMany(mappedBy = "video", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<Segment> segments;

    public Video() {}
}

