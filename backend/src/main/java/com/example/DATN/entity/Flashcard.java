package com.example.DATN.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "flashcards")
public class Flashcard {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deck_id")
    private FlashcardDeck deck;


    // Link to custom user vocabulary
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "custom_vocab_id", nullable = true)
    private UserVocabularyCustom customVocab;

    // Optional override text for the card
    @Column(name = "front_text", columnDefinition = "TEXT")
    private String frontText;

    @Column(name = "back_text", columnDefinition = "TEXT")
    private String backText;

    @Column(name = "created_at")
    private Date createdAt;

    public Flashcard() {
        this.createdAt = new Date();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public FlashcardDeck getDeck() { return deck; }
    public void setDeck(FlashcardDeck deck) { this.deck = deck; }


    public UserVocabularyCustom getCustomVocab() { return customVocab; }
    public void setCustomVocab(UserVocabularyCustom customVocab) { this.customVocab = customVocab; }

    public String getFrontText() { return frontText; }
    public void setFrontText(String frontText) { this.frontText = frontText; }

    public String getBackText() { return backText; }
    public void setBackText(String backText) { this.backText = backText; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
}
