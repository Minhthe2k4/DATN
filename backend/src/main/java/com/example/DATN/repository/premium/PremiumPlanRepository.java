package com.example.DATN.repository.premium;

import com.example.DATN.entity.PremiumPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Repository quản lý thông tin các gói cước Premium (Monthly, Yearly, Free).
 */
public interface PremiumPlanRepository extends JpaRepository<PremiumPlan, Long> {
    Optional<PremiumPlan> findByName(String name);
}
