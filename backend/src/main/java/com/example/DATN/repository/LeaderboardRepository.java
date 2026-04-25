package com.example.DATN.repository;

import com.example.DATN.entity.Leaderboard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LeaderboardRepository extends JpaRepository<Leaderboard, Long> {
    Optional<Leaderboard> findByUser_Id(Long userId);

    @Modifying
    @Query(value = "TRUNCATE TABLE leaderboard", nativeQuery = true)
    void truncateTable();
}
