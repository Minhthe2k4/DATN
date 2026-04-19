package com.example.DATN.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "lesson_vocabulary")
@IdClass(LessonVocabularyId.class)
public class LessonVocabulary {
    @Id
    @Column(name = "lesson_id")
    public Long lessonId;

    @Id
    @Column(name = "vocab_id")
    public Long vocabId;

    public LessonVocabulary() {}
}

