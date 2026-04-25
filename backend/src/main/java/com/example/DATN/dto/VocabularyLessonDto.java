package com.example.DATN.dto;

import java.util.List;

public class VocabularyLessonDto {
    public Long id;
    public String title;
    public String description;
    public List<LessonWordDto> words;
    public Boolean isPremium;


    public VocabularyLessonDto() {}

    public VocabularyLessonDto(Long id, String title, String description, List<LessonWordDto> words, Boolean isPremium) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.words = words;
        this.isPremium = isPremium;
    }

    public static class LessonWordDto {
        public String word;
        public String pronunciation;
        public String meaningEn;
        public String meaningVi;
        public String example;

        public LessonWordDto() {}

        public LessonWordDto(String word, String pronunciation, String meaningEn, String meaningVi, String example) {
            this.word = word;
            this.pronunciation = pronunciation;
            this.meaningEn = meaningEn;
            this.meaningVi = meaningVi;
            this.example = example;
        }
    }
}
