package com.example.DATN.repository.projections;

/**
 * Projection interface for spaced repetition reset candidates.
 */
public interface ResetCandidateProjection {
    Long getUserId();

    String getEmail();

    Long getWordsTracked();

    Long getTotalErrors();

    Long getTotalAttempts();

    Double getAvgDifficulty();
}
