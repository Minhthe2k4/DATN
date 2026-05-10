package com.example.DATN.repository.projections;

/**
 * Projection interface for top user activity rows.
 */
public interface TopUserActivityProjection {
    String getUsername();

    Long getStreakDays();

    Long getLearnedWords();

    Long getTotalWords();
}
