package com.example.DATN.repository;

import com.example.DATN.entity.UserFavorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserFavoriteRepository extends JpaRepository<UserFavorite, Long> {
    List<UserFavorite> findByUserIdAndTargetType(Long userId, String targetType);
    Optional<UserFavorite> findByUserIdAndTargetIdAndTargetType(Long userId, Long targetId, String targetType);
    boolean existsByUserIdAndTargetIdAndTargetType(Long userId, Long targetId, String targetType);
    void deleteByUserIdAndTargetIdAndTargetType(Long userId, Long targetId, String targetType);
}
