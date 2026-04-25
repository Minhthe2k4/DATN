package com.example.DATN.dto;

import java.util.Date;

public class UserVocabularyCustomDto {
    public Long id;
    public String word;
    public String pronunciation;
    public String partOfSpeech;
    public String meaningEn;
    public String meaningVi;
    public String example;
    public String exampleVi;
    public String level;
    public String levelSource;
    public Date createdAt;
    public Date updatedAt;

    public UserVocabularyCustomDto() {}

    public UserVocabularyCustomDto(Long id, String word, String pronunciation,
                                   String partOfSpeech, String meaningEn, String meaningVi,
                                   String example, String exampleVi, String level, String levelSource,
                                   Date createdAt, Date updatedAt) {
        this.id = id;
        this.word = word;
        this.pronunciation = pronunciation;
        this.partOfSpeech = partOfSpeech;
        this.meaningEn = meaningEn;
        this.meaningVi = meaningVi;
        this.example = example;
        this.exampleVi = exampleVi;
        this.level = level;
        this.levelSource = levelSource;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
