package com.example.DATN.dto;

import java.util.Date;
import java.util.List;

public class FlashcardDto {
    public Long id;
    public Long deckId;
    public String frontText;
    public String backText;
    public Date createdAt;
    
    // Original word info if linked
    public String originalWord;
    public String meaningVi;
    public String pronunciation;

    public static class DeckDto {
        public Long id;
        public String name;
        public String description;
        public Long folderId;
        public int cardCount;
        public Date updatedAt;
    }

    public static class FolderDto {
        public Long id;
        public String name;
        public List<DeckDto> decks;
    }
}
