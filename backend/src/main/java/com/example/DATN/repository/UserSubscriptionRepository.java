package com.example.DATN.repository;

import com.example.DATN.entity.UserSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Optional;

public interface UserSubscriptionRepository extends JpaRepository<UserSubscription, Long> {
    Optional<UserSubscription> findByUserId(Long userId);

    @Query("SELECT COUNT(DISTINCT us.user.id) FROM UserSubscription us WHERE us.status = 'ACTIVE' AND us.isPremium = true AND (us.endDate IS NULL OR us.endDate > :now)")
    long countDistinctActivePremiumUsers(@Param("now") LocalDateTime now);

    @Query("SELECT COUNT(us.id) FROM UserSubscription us WHERE us.status = 'ACTIVE' AND us.isPremium = true AND (us.endDate IS NULL OR us.endDate > :now)")
    long countActivePremiumUsers(@Param("now") LocalDateTime now);

    @Query("SELECT us FROM UserSubscription us WHERE us.user.id = :userId AND us.status = 'ACTIVE' AND (us.endDate IS NULL OR us.endDate > :now) ORDER BY us.endDate DESC")
    List<UserSubscription> findActiveSubscriptionsByUserId(@Param("userId") Long userId, @Param("now") Date now);

    @Query("SELECT us.id as subscriptionId, us.user.id as userId, us.user.email as email, " +
           "us.plan.name as planName, us.startDate as startDate, us.endDate as endDate, us.status as status " +
           "FROM UserSubscription us")
    List<PremiumMemberProjection> findLatestMembers();

    @Query("SELECT us FROM UserSubscription us WHERE us.user.id = :userId ORDER BY us.endDate DESC")
    List<UserSubscription> findLatestByUserId(@Param("userId") Long userId);
}
