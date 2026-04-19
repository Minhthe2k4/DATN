package com.example.DATN.entity;

import java.io.Serializable;
import java.util.Objects;

public class LessonVocabularyId implements Serializable {
    public Long lessonId;
    public Long vocabId;

    public LessonVocabularyId() {}

    public LessonVocabularyId(Long lessonId, Long vocabId) {
        this.lessonId = lessonId;
        this.vocabId = vocabId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        LessonVocabularyId that = (LessonVocabularyId) o;
        return Objects.equals(lessonId, that.lessonId) && Objects.equals(vocabId, that.vocabId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(lessonId, vocabId);
    }
}

