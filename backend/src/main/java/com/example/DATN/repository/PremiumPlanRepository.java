package com.example.DATN.repository;

import com.example.DATN.entity.PremiumPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PremiumPlanRepository extends JpaRepository<PremiumPlan, Long> {
    Optional<PremiumPlan> findByName(String name);
}
