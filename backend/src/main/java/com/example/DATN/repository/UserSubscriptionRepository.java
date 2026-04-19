package com.example.DATN.repository;

import com.example.DATN.entity.UserSubscription;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserSubscriptionRepository extends JpaRepository<UserSubscription, Long> {
    @Query("""
            select count(us)
            from UserSubscription us
            where upper(coalesce(us.status, '')) in ('ACTIVE', 'ACTIVATED', 'PAID', 'PREMIUM')
              and (us.endDate is null or us.endDate >= :now)
            """)
    long countActivePremiumUsers(@Param("now") LocalDateTime now);

    @Query("""
            select count(distinct us.user.id)
            from UserSubscription us
            where upper(coalesce(us.status, '')) in ('ACTIVE', 'ACTIVATED', 'PAID', 'PREMIUM')
              and (us.endDate is null or us.endDate >= :now)
            """)
    long countDistinctActivePremiumUsers(@Param("now") LocalDateTime now);

    @Query(value = """
            select us.id as subscriptionId,
                   u.id as userId,
                   u.email as email,
                   pp.name as planName,
                   us.end_date as endDate,
                   us.status as status
            from User_Subscriptions us
            join Users u on u.id = us.user_id
            left join Premium_Plans pp on pp.id = us.plan_id
            where u.deleted_at is null
              and upper(coalesce(us.status, '')) in ('ACTIVE', 'ACTIVATED', 'PAID', 'PREMIUM')
              and (us.end_date is null or us.end_date >= :now)
              and us.id in (
                  select max(x.id)
                  from User_Subscriptions x
                  where x.user_id = us.user_id
                    and upper(coalesce(x.status, '')) in ('ACTIVE', 'ACTIVATED', 'PAID', 'PREMIUM')
                    and (x.end_date is null or x.end_date >= :now)
                  group by x.user_id
              )
            order by us.end_date asc
            """, nativeQuery = true)
    List<PremiumMemberProjection> findActiveMembers(@Param("now") Date now);

              @Query(value = """
                select us.id as subscriptionId,
                 u.id as userId,
                 u.email as email,
                 pp.name as planName,
                 us.start_date as startDate,
                 us.end_date as endDate,
                 us.status as status
                from User_Subscriptions us
                join Users u on u.id = us.user_id
                left join Premium_Plans pp on pp.id = us.plan_id
                where u.deleted_at is null
                  and us.id in (
                select max(x.id)
                from User_Subscriptions x
                group by x.user_id
                  )
                order by coalesce(us.end_date, now()) asc
                """, nativeQuery = true)
              List<PremiumMemberProjection> findLatestMembers();

    @Query("""
            select us
            from UserSubscription us
            where us.user.id = :userId
              and upper(coalesce(us.status, '')) in ('ACTIVE', 'ACTIVATED', 'PAID', 'PREMIUM')
              and (us.endDate is null or us.endDate >= :now)
            order by us.endDate desc, us.id desc
            """)
    List<UserSubscription> findActiveSubscriptionsByUserId(@Param("userId") Long userId, @Param("now") Date now);

    @Query("""
            select us
            from UserSubscription us
            where us.id = :id
            """)
    Optional<UserSubscription> findOneById(@Param("id") Long id);

        @Query("""
          select us
          from UserSubscription us
          where us.user.id = :userId
          order by us.endDate desc, us.id desc
          """)
        List<UserSubscription> findLatestByUserId(@Param("userId") Long userId);
}
