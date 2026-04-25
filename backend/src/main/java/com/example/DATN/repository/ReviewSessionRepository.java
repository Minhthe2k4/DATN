package com.example.DATN.repository;

import com.example.DATN.entity.ReviewSession;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReviewSessionRepository extends JpaRepository<ReviewSession, Long> {
    long countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(LocalDateTime start, LocalDateTime end);

    @Query("select coalesce(avg(rs.accuracy), 0) from ReviewSession rs")
    Optional<Double> averageAccuracy();

    @Query("select count(distinct rs.user.id) from ReviewSession rs where rs.createdAt >= :start and rs.createdAt < :end")
    long countDistinctUsersInRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    java.util.List<ReviewSession> findByUser_Id(Long userId);
}
