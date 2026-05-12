package com.example.DATN.repository.user;

import com.example.DATN.repository.projections.*;
import com.example.DATN.entity.User;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

// Repository layer cho thực thể User.
// Quản lý các thao tác truy vấn dữ liệu người dùng, hỗ trợ xác thực (Authentication)
// và phân quyền (Authorization). Sử dụng cơ chế Soft Delete (deleted_at).
public interface UserRepository extends JpaRepository<User, Long> {
  // Xóa vĩnh viễn tài khoản người dùng khỏi hệ thống.
  @Modifying
  @Transactional
  @Query(value = "DELETE FROM users WHERE id = :id", nativeQuery = true)
  void hardDelete(Long id);

  // Khôi phục tài khoản đã bị xóa mềm.
  @Modifying
  @Transactional
  @Query(value = "UPDATE users SET deleted_at = NULL, is_active = true WHERE id = :id", nativeQuery = true)
  void restore(Long id);

  // Đếm số lượng người dùng đang hoạt động.
  @Query("select count(u) from User u where u.deletedAt is null and u.isActive = true")
  long countByIsActiveTrue();

  // Đếm số lượng tài khoản đang bị khóa.
  @Query("select count(u) from User u where u.deletedAt is null and (u.isActive = false or u.isActive is null)")
  long countByIsActiveFalse();

  // Đếm số lượng người dùng mới trong một khoảng thời gian.
  @Query("""
      select count(u)
      from User u
      where u.deletedAt is null
        and u.createdAt >= :start
        and u.createdAt < :end
      """)
  long countByCreatedAtGreaterThanEqualAndCreatedAtLessThan(
      @Param("start") LocalDateTime start,
      @Param("end") LocalDateTime end);

  // Tổng số lượng người dùng hiện có (không tính đã xóa).
  @Query("select count(u) from User u where u.deletedAt is null")
  long count();

  // Truy vấn danh sách người dùng kèm theo thông tin Premium phục vụ Dashboard Admin.
  @Query(value = """
      select u.id as id,
           u.username as username,
           u.email as email,
           u.role as role,
           u.is_active as isActive,
           u.created_at as createdAt,
           u.updated_at as updatedAt,
           u.deleted_at as deletedAt,
           up.full_name as fullName,
           up.avatar as avatar,
           u.phone_number as phoneNumber,
           case when ps.user_id is null then false else true end as isPremium,
           ps.premium_until as premiumUntil
      from Users u
      left join User_Profile up on up.user_id = u.id
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

  @Query(value = """
      select u.id as id,
           u.username as username,
           u.email as email,
           u.role as role,
           u.is_active as isActive,
           u.created_at as createdAt,
           u.updated_at as updatedAt,
           u.deleted_at as deletedAt,
           up.full_name as fullName,
           up.avatar as avatar,
           u.phone_number as phoneNumber,
           case when ps.user_id is null then false else true end as isPremium,
           ps.premium_until as premiumUntil
      from Users u
      left join User_Profile up on up.user_id = u.id
      left join (
        select us.user_id, max(us.end_date) as premium_until
        from User_Subscriptions us
        where upper(coalesce(us.status, '')) in ('ACTIVE', 'ACTIVATED', 'PAID', 'PREMIUM')
          and (us.end_date is null or us.end_date >= :now)
        group by us.user_id
      ) ps on ps.user_id = u.id
      where u.deleted_at is not null
      order by u.deleted_at desc
      """, nativeQuery = true)
  List<UserManagementProjection> findDeletedRows(@Param("now") Date now);

  @Query(value = """
      select u.id as id,
           u.username as username,
           u.email as email,
           u.role as role,
           u.is_active as isActive,
           u.created_at as createdAt,
           u.updated_at as updatedAt,
           u.deleted_at as deletedAt,
           up.full_name as fullName,
           up.avatar as avatar,
           u.phone_number as phoneNumber,
           case when ps.user_id is null then false else true end as isPremium,
           ps.premium_until as premiumUntil
      from Users u
      left join User_Profile up on up.user_id = u.id
      left join (
        select us.user_id, max(us.end_date) as premium_until
        from User_Subscriptions us
        where upper(coalesce(us.status, '')) in ('ACTIVE', 'ACTIVATED', 'PAID', 'PREMIUM')
          and (us.end_date is null or us.end_date >= :now)
        group by us.user_id
      ) ps on ps.user_id = u.id
      where u.id = :id
      """, nativeQuery = true)
  Optional<UserManagementProjection> findUserManagementRowById(@Param("id") Long id, @Param("now") Date now);

  @Query("""
      select u
      from User u
      where u.id = :id and u.deletedAt is null
      """)
  Optional<User> findActiveById(@Param("id") Long id);

  // Tìm người dùng đang hoạt động (không bị xóa) theo Email.
  // Được sử dụng trong luồng Đăng nhập và Quên mật khẩu.
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
