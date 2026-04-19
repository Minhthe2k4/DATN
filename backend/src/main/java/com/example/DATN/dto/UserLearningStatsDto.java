package com.example.DATN.dto;

import java.util.Date;
import java.util.Map;

public class UserLearningStatsDto {
    public Long totalTracked;
    public Long totalPossible;
    public Long dueCount;
    public Date nextReviewTime;
    public Map<Integer, Long> levelDistribution;

    public UserLearningStatsDto() {}

    public UserLearningStatsDto(Long totalTracked, Long totalPossible, Long dueCount, Date nextReviewTime, Map<Integer, Long> levelDistribution) {
        this.totalTracked = totalTracked;
        this.totalPossible = totalPossible;
        this.dueCount = dueCount;
        this.nextReviewTime = nextReviewTime;
        this.levelDistribution = levelDistribution;
    }
}
