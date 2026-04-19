package com.example.DATN.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "premium_plans")
public class PremiumPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    public Long id;

    @Column(name = "name", length = 100)
    public String name;

    @Column(name = "price")
    public Double price;

    @Column(name = "duration")
    public Integer duration;

    @Column(name = "description", columnDefinition = "TEXT")
    public String description;

    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<PremiumFeatureLimit> featureLimits;

    public PremiumPlan() {}

    public java.util.List<PremiumFeatureLimit> getFeatureLimits() {
        return featureLimits;
    }

    public void setFeatureLimits(java.util.List<PremiumFeatureLimit> featureLimits) {
        this.featureLimits = featureLimits;
    }
}

