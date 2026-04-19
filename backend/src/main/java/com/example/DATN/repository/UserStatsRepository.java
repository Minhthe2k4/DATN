package com.example.DATN.repository;

import com.example.DATN.entity.UserStats;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface UserStatsRepository extends JpaRepository<UserStats, Long> {
    @Query("""
            select coalesce(avg(
                case
                    when us.totalWords is not null and us.totalWords > 0
                    then (coalesce(us.learnedWords, 0) * 100.0) / us.totalWords
                    else null
                end
            ), 0)
            from UserStats us
            """)
    Optional<Double> averageCompletionRate();

    @Query("""
            select u.username as username,
                   us.streakDays as streakDays,
                   us.learnedWords as learnedWords,
                   us.totalWords as totalWords
            from UserStats us
            join us.user u
            order by coalesce(us.learnedWords, 0) desc
            """)
    List<TopUserActivityProjection> findTopUsers(Pageable pageable);

    Optional<UserStats> findByUser_Id(Long userId);
}
