package com.example.DATN.dto;

import java.util.List;

public class VocabularyLessonDto {
    public Long id;
    public String title;
    public String description;
    public List<LessonWordDto> words;

    public VocabularyLessonDto() {}

    public VocabularyLessonDto(Long id, String title, String description, List<LessonWordDto> words) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.words = words;
    }

    public static class LessonWordDto {
        public String word;
        public String phonetic;
        public String meaningEn;
        public String meaningVi;
        public String example;

        public LessonWordDto() {}

        public LessonWordDto(String word, String phonetic, String meaningEn, String meaningVi, String example) {
            this.word = word;
            this.phonetic = phonetic;
            this.meaningEn = meaningEn;
            this.meaningVi = meaningVi;
            this.example = example;
        }
    }
}
