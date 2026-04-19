package com.example.DATN.repository;

import com.example.DATN.entity.User;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {
    @Query("select count(u) from User u where u.deletedAt is null and u.isActive = true")
    long countByIsActiveTrue();

    @Query("select count(u) from User u where u.deletedAt is null and (u.isActive = false or u.isActive is null)")
    long countByIsActiveFalse();

    @Query("""
            select count(u)
            from User u
            where u.deletedAt is null
              and u.createdAt >= :start
              and u.createdAt < :end
            """)
    long countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    @Query("select count(u) from User u where u.deletedAt is null")
    long count();

    @Query(value = """
        select u.id as id,
             u.username as username,
             u.email as email,
             u.role as role,
             u.is_active as isActive,
             u.created_at as createdAt,
             up.full_name as fullName,
             coalesce(ust.learned_words, 0) as learnedWords,
             rs.last_review_at as lastReviewAt,
             case when ps.user_id is null then false else true end as isPremium,
             ps.premium_until as premiumUntil
        from Users u
        left join User_Profile up on up.user_id = u.id
        left join User_Stats ust on ust.user_id = u.id
        left join (
          select user_id, max(created_at) as last_review_at
          from Review_Sessions
          group by user_id
        ) rs on rs.user_id = u.id
        left join (
          select us.user_id, max(us.end_date) as premium_until
          from User_Subscriptions us
          where upper(coalesce(us.status, '')) in ('ACTIVE', 'ACTIVATED', 'PAID', 'PREMIUM')
            and (us.end_date is null or us.end_date >= :now)
          group by us.user_id
        ) ps on ps.user_id = u.id
        where u.deleted_at is null
        order by u.created_at desc
        """, nativeQuery = true)
    List<UserManagementProjection> findUserManagementRows(@Param("now") Date now);

    @Query("""
            select u
            from User u
            where u.id = :id and u.deletedAt is null
            """)
    Optional<User> findActiveById(@Param("id") Long id);

        @Query("""
          select u
          from User u
          where lower(u.email) = lower(:email)
            and u.deletedAt is null
          """)
        Optional<User> findActiveByEmail(@Param("email") String email);

        @Query("""
              select u
              from User u
              where lower(u.username) = lower(:username)
                and u.deletedAt is null
              """)
        Optional<User> findActiveByUsername(@Param("username") String username);

        @Query("""
              select (count(u) > 0)
              from User u
              where lower(u.email) = lower(:email)
                and u.deletedAt is null
              """)
        boolean existsActiveByEmail(@Param("email") String email);

        @Query("""
              select (count(u) > 0)
              from User u
              where lower(u.username) = lower(:username)
                and u.deletedAt is null
              """)
        boolean existsActiveByUsername(@Param("username") String username);
}
