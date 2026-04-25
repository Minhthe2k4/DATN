package com.example.DATN.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "User_Stats")
public class UserStats {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	public Long id;

	@ManyToOne
	@JoinColumn(name = "user_id")
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

	public UserStats() {}
}
