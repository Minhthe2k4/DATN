package com.example.DATN.repository;

import com.example.DATN.entity.PremiumFeatureLimit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PremiumFeatureLimitRepository extends JpaRepository<PremiumFeatureLimit, Long> {
    List<PremiumFeatureLimit> findByPlanId(Long planId);
    void deleteByPlanId(Long planId);
}
