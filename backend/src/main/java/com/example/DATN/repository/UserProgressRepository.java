package com.example.DATN.repository;

import com.example.DATN.entity.UserProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserProgressRepository extends JpaRepository<UserProgress, Long> {
    List<UserProgress> findByUserIdAndTargetType(Long userId, String targetType);
    Optional<UserProgress> findByUserIdAndTargetIdAndTargetType(Long userId, Long targetId, String targetType);
}
