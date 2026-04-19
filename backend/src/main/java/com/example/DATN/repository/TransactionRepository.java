package com.example.DATN.repository;

import com.example.DATN.entity.Transaction;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    @Query("select count(t) from Transaction t where upper(coalesce(t.status, '')) in :statuses")
    long countByStatuses(@Param("statuses") Collection<String> statuses);

    @Query("""
            select t.id as id,
                 u.id as userId,
                 s.id as subscriptionId,
                   u.email as email,
                   t.createdAt as requestedAt,
                   p.name as packageName,
                   t.status as status
            from Transaction t
            left join t.user u
            left join t.subscription s
            left join s.plan p
            where upper(coalesce(t.status, '')) in :statuses
            order by t.createdAt desc
            """)
    List<PendingPremiumRequestProjection> findPendingRequests(
            @Param("statuses") Collection<String> statuses,
            Pageable pageable
    );

        @Query("""
            select t.id as id,
               u.id as userId,
               s.id as subscriptionId,
               u.email as email,
               t.createdAt as requestedAt,
               p.name as packageName,
               t.status as status
            from Transaction t
            left join t.user u
            left join t.subscription s
            left join s.plan p
            order by t.createdAt desc
            """)
        List<PendingPremiumRequestProjection> findAllRequestRows(Pageable pageable);

            @Query("""
                select t.id as id,
                   u.email as email,
                   p.name as planName,
                   t.amount as amount,
                   t.paymentMethod as paymentMethod,
                   t.status as status,
                   t.createdAt as createdAt
                from Transaction t
                left join t.user u
                left join t.subscription s
                left join s.plan p
                order by t.createdAt desc
                """)
            List<RevenueTransactionProjection> findRevenueRows(Pageable pageable);
}
