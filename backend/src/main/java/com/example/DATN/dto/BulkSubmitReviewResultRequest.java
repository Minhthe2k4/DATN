package com.example.DATN.dto;

import java.util.List;

public record BulkSubmitReviewResultRequest(
    List<SubmitReviewResultRequest> results
) {}
