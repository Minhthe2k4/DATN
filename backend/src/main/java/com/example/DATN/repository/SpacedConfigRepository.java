package com.example.DATN.repository;

import com.example.DATN.entity.SpacedConfig;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpacedConfigRepository extends JpaRepository<SpacedConfig, Integer> {
    Optional<SpacedConfig> findTopByOrderByIdAsc();
}
