package com.example.DATN.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "segments")
public class Segment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    public Long id;

    @Column(name = "segment_order")
    @com.fasterxml.jackson.annotation.JsonProperty("segmentOrder")
    public Long segmentOrder;

    @Column(name = "start_sec")
    @com.fasterxml.jackson.annotation.JsonProperty("startSec")
    public Double startSec;

    @Column(name = "end_sec")
    @com.fasterxml.jackson.annotation.JsonProperty("endSec")
    public Double endSec;

    @Column(name = "text", columnDefinition = "TEXT")
    @com.fasterxml.jackson.annotation.JsonProperty("text")
    public String text;

    @ManyToOne
    @JoinColumn(name = "video_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    public Video video;

    public Segment() {}

    public Segment(Long segmentOrder, Double startSec, Double endSec, String text, Video video) {
        this.segmentOrder = segmentOrder;
        this.startSec = startSec;
        this.endSec = endSec;
        this.text = text;
        this.video = video;
    }
}
