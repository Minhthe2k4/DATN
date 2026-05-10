package com.example.DATN.dto.user;

import java.util.List;

public record BulkSubmitReviewResultRequest(
    List<SubmitReviewResultRequest> results
) {}
