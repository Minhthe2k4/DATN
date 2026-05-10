package com.example.DATN.dto.admin;

public record AdminSpacedConfigDto(
        Long id,
        Double beta0,
        Double beta1,
        Double beta2,
        Double beta3,
        Integer k,
        Integer maxInterval
) {
}
