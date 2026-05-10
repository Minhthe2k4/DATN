package com.example.DATN.dto.user;

public class WeeklyStudyDTO {
    public String label; // Thứ 2, Thứ 3... hoặc T2, T3...
    public double minutes;

    public WeeklyStudyDTO(String label, double minutes) {
        this.label = label;
        this.minutes = minutes;
    }
}
