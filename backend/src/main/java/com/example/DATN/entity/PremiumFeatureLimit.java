package com.example.DATN.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
@Table(name = "premium_feature_limits")
public class PremiumFeatureLimit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id")
    @JsonBackReference
    private PremiumPlan plan;

    @Column(name = "feature_name", length = 100, nullable = false)
    private String featureName;

    @Column(name = "is_locked")
    private Boolean isLocked = false;

    @Column(name = "usage_limit")
    private Integer usageLimit;

    public PremiumFeatureLimit() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public PremiumPlan getPlan() { return plan; }
    public void setPlan(PremiumPlan plan) { this.plan = plan; }

    public String getFeatureName() { return featureName; }
    public void setFeatureName(String featureName) { this.featureName = featureName; }

    public Boolean getIsLocked() { return isLocked; }
    public void setIsLocked(Boolean isLocked) { this.isLocked = isLocked; }

    public Integer getUsageLimit() { return usageLimit; }
    public void setUsageLimit(Integer usageLimit) { this.usageLimit = usageLimit; }
}
