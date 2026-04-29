package com.example.DATN.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "user_stats")
public class UserStats {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	public Long id;

	@OneToOne
	@JoinColumn(name = "user_id", unique = true)
	public User user;

	@Column(name = "total_words")
	public Integer totalWords;

	@Column(name = "learned_words")
	public Integer learnedWords;

	@Column(name = "accuracy")
	public Float accuracy;

	@Column(name = "streak_days")
	public Integer streakDays;

	@Column(name = "total_study_time")
	public Double totalStudyTime;

	@Column(name = "last_review_notification")
	@Temporal(TemporalType.TIMESTAMP)
	public Date lastReviewNotification;

	@Column(name = "last_study_date")
	@Temporal(TemporalType.DATE)
	public Date lastStudyDate;

	public UserStats() {}
}
