package com.example.DATN.dto;

import java.util.List;

public class VocabularyTopicDto {
    public Long id;
    public String title;
    public String description;
    public String image;
    public List<LessonSummaryDto> lessons;

    public VocabularyTopicDto() {}

    public VocabularyTopicDto(Long id, String title, String description, String image, List<LessonSummaryDto> lessons) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.image = image;
        this.lessons = lessons;
    }

    public static class LessonSummaryDto {
        public Long id;
        public String title;
        public String description;
        public Integer wordCount;

        public LessonSummaryDto() {}

        public LessonSummaryDto(Long id, String title, String description, Integer wordCount) {
            this.id = id;
            this.title = title;
            this.description = description;
            this.wordCount = wordCount;
        }
    }
}
