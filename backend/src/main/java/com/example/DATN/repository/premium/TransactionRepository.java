package com.example.DATN.repository.premium;

import com.example.DATN.repository.projections.*;
import com.example.DATN.entity.Transaction;
import java.util.Collection;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Repository quản lý các giao dịch thanh toán trong hệ thống.
 * Lưu trữ lịch sử nâng cấp Premium của người dùng.
 */
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    // Đếm số lượng giao dịch dựa trên danh sách các trạng thái truyền vào (vd: PENDING, SUCCESS)
    @Query("select count(t) from Transaction t where upper(coalesce(t.status, '')) in :statuses")
    long countByStatuses(@Param("statuses") Collection<String> statuses);

    // Tìm kiếm giao dịch theo mã định danh từ cổng thanh toán (ZaloPay transId)
    java.util.Optional<Transaction> findByPaymentTransId(String paymentTransId);

    // Truy vấn danh sách các yêu cầu nâng cấp đang chờ xử lý (Dùng cho giao diện Admin)
    // Kết hợp thông tin từ bảng Transaction, User và Subscription
    @Query("""
            select t.id as id,
                 u.id as userId,
                 s.id as subscriptionId,
                   u.email as email,
                   t.createdAt as requestedAt,
                   coalesce(tp.name, sp.name) as packageName,
                   t.status as status
            from Transaction t
            left join t.user u
            left join t.plan tp
            left join t.subscription s
            left join s.plan sp
            where upper(coalesce(t.status, '')) in :statuses
            order by t.createdAt desc
            """)
    List<PendingPremiumRequestProjection> findPendingRequests(
            @Param("statuses") Collection<String> statuses,
            Pageable pageable);

    @Query("""
            select t.id as id,
               u.id as userId,
               s.id as subscriptionId,
               u.email as email,
               t.createdAt as requestedAt,
               coalesce(tp.name, sp.name) as packageName,
               t.status as status
            from Transaction t
            left join t.user u
            left join t.plan tp
            left join t.subscription s
            left join s.plan sp
            order by t.createdAt desc
            """)
    List<PendingPremiumRequestProjection> findAllRequestRows(Pageable pageable);

    // Truy vấn dữ liệu phục vụ báo cáo doanh thu
    // Lấy thông tin về số tiền, phương thức thanh toán và thời gian giao dịch
    @Query("""
            select t.id as id,
               u.email as email,
               coalesce(tp.name, sp.name) as planName,
               t.amount as amount,
               t.paymentMethod as paymentMethod,
               t.status as status,
               t.createdAt as createdAt
            from Transaction t
            left join t.user u
            left join t.plan tp
            left join t.subscription s
            left join s.plan sp
            order by t.createdAt desc
            """)
    List<RevenueTransactionProjection> findRevenueRows(Pageable pageable);
}
