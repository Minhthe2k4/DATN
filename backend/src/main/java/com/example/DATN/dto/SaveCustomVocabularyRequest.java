package com.example.DATN.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class SaveCustomVocabularyRequest {
    @JsonProperty("vocabularies")
    public List<CustomVocabularyItem> vocabularies;

    public SaveCustomVocabularyRequest() {}

    public static class CustomVocabularyItem {
        @JsonProperty("word")
        public String word;

        @JsonProperty("phonetic")
        public String phonetic;

        @JsonProperty("meaningEn")
        public String meaningEn;

        @JsonProperty("meaningVi")
        public String meaningVi;

        @JsonProperty("example")
        public String example;

        @JsonProperty("exampleVi")
        public String exampleVi;

        @JsonProperty("level")
        public String level;

        @JsonProperty("levelSource")
        public String levelSource;

        public CustomVocabularyItem() {}
    }
}
