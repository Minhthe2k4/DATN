package com.example.DATN.dto;

import java.util.Date;

public record ReviewQueueItemDto(
    Long id,
    Long vocabId,
    String word,
    String pronunciation,
    String meaningEn,
    String meaningVi,
    String example,
    String exampleVi,
    String level,
    boolean isCustom,
    Date nextReview
) {}
