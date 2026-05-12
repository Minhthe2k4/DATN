package com.example.DATN.repository.premium;

import com.example.DATN.repository.projections.*;
import com.example.DATN.entity.UserSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Optional;

// Repository quản lý thông tin đăng ký (Subscriptions) của người dùng.
// Lưu trữ trạng thái sở hữu Premium, thời gian hiệu lực và liên kết với các gói cước.
public interface UserSubscriptionRepository extends JpaRepository<UserSubscription, Long> {
    // Đếm số lượng người dùng duy nhất đang sở hữu Premium còn hạn.
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
