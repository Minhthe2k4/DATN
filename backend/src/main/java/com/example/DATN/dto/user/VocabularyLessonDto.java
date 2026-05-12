package com.example.DATN.dto.user;

import java.util.List;

public class VocabularyLessonDto {
    public Long id;
    public String title;
    public String description;
    public List<LessonWordDto> words;
    public Boolean isPremium;
    public String image;


    public VocabularyLessonDto() {}

    public VocabularyLessonDto(Long id, String title, String description, List<LessonWordDto> words, Boolean isPremium, String image) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.words = words;
        this.isPremium = isPremium;
        this.image = image;
    }

    public static class LessonWordDto {
        public String word;
        public String pronunciation;
        public String meaningEn;
        public String meaningVi;
        public String example;
        public String exampleVi;

        public LessonWordDto() {}

        public LessonWordDto(String word, String pronunciation, String meaningEn, String meaningVi, String example, String exampleVi) {
            this.word = word;
            this.pronunciation = pronunciation;
            this.meaningEn = meaningEn;
            this.meaningVi = meaningVi;
            this.example = example;
            this.exampleVi = exampleVi;
        }
    }
}
