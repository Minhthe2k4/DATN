package com.example.DATN.controller;

import com.example.DATN.dto.FlashcardDto;
import com.example.DATN.entity.Flashcard;
import com.example.DATN.entity.FlashcardDeck;
import com.example.DATN.entity.FlashcardFolder;
import com.example.DATN.service.FlashcardService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user/flashcards")
public class FlashcardController {

    @Autowired
    private FlashcardService flashcardService;

    private Long getUserIdFromAuth(Authentication auth, HttpServletRequest request) {
        if (auth != null && !auth.getName().equals("anonymousUser")) {
            try { return Long.parseLong(auth.getName()); } catch (Exception ignored) {}
        }
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            try { return Long.parseLong(bearerToken.substring(7)); } catch (Exception ignored) {}
        }
        return null;
    }

    @GetMapping("/folders")
    public ResponseEntity<?> getFolders(Authentication auth, HttpServletRequest request) {
        Long userId = getUserIdFromAuth(auth, request);
        if (userId == null) return ResponseEntity.status(401).body("Unauthorized");

        List<FlashcardFolder> folders = flashcardService.getFolders(userId);
        return ResponseEntity.ok(folders.stream().map(f -> mapToFolderDto(userId, f)).collect(Collectors.toList()));
    }

    @PostMapping("/folders")
    public ResponseEntity<?> createFolder(@RequestBody FlashcardFolder folder, Authentication auth, HttpServletRequest request) {
        Long userId = getUserIdFromAuth(auth, request);
        if (userId == null) return ResponseEntity.status(401).body("Unauthorized");

        return ResponseEntity.ok(mapToFolderDto(userId, flashcardService.createFolder(userId, folder.getName())));
    }

    @PutMapping("/folders/{id:[0-9]+}")
    public ResponseEntity<?> updateFolder(@PathVariable Long id, @RequestBody FlashcardFolder folder, Authentication auth, HttpServletRequest request) {
        Long userId = getUserIdFromAuth(auth, request);
        if (userId == null) return ResponseEntity.status(401).body("Unauthorized");

        return ResponseEntity.ok(mapToFolderDto(userId, flashcardService.updateFolder(userId, id, folder.getName())));
    }

    @DeleteMapping("/folders/{id:[0-9]+}")
    public ResponseEntity<?> deleteFolder(@PathVariable Long id, Authentication auth, HttpServletRequest request) {
        Long userId = getUserIdFromAuth(auth, request);
        if (userId == null) return ResponseEntity.status(401).body("Unauthorized");

        flashcardService.deleteFolder(userId, id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/decks")
    public ResponseEntity<?> getDecks(Authentication auth, HttpServletRequest request) {
        Long userId = getUserIdFromAuth(auth, request);
        if (userId == null) return ResponseEntity.status(401).body("Unauthorized");

        List<FlashcardDeck> decks = flashcardService.getDecks(userId);
        return ResponseEntity.ok(decks.stream().map(d -> mapToDeckDto(userId, d)).collect(Collectors.toList()));
    }

    @PostMapping("/decks")
    public ResponseEntity<?> createDeck(@RequestBody FlashcardDto.DeckDto deckDto, Authentication auth, HttpServletRequest request) {
        Long userId = getUserIdFromAuth(auth, request);
        if (userId == null) return ResponseEntity.status(401).body("Unauthorized");

        FlashcardDeck deck = flashcardService.createDeck(userId, deckDto.folderId, deckDto.name, deckDto.description);
        return ResponseEntity.ok(mapToDeckDto(userId, deck));
    }

    @PutMapping("/decks/{id:[0-9]+}")
    public ResponseEntity<?> updateDeck(@PathVariable Long id, @RequestBody FlashcardDto.DeckDto deckDto, Authentication auth, HttpServletRequest request) {
        Long userId = getUserIdFromAuth(auth, request);
        if (userId == null) return ResponseEntity.status(401).body("Unauthorized");

        FlashcardDeck deck = flashcardService.updateDeck(userId, id, deckDto.folderId, deckDto.name, deckDto.description);
        return ResponseEntity.ok(mapToDeckDto(userId, deck));
    }

    @GetMapping("/decks/{deckId:[0-9]+}/cards")
    public ResponseEntity<?> getCards(@PathVariable Long deckId, Authentication auth, HttpServletRequest request) {
        Long userId = getUserIdFromAuth(auth, request);
        if (userId == null) return ResponseEntity.status(401).body("Unauthorized");

        System.out.println("[DEBUG] Fetching cards for deck: " + deckId + " by user: " + userId);
        List<Flashcard> cards = flashcardService.getCards(userId, deckId);
        System.out.println("[DEBUG] Found " + (cards != null ? cards.size() : 0) + " cards");
        return ResponseEntity.ok(cards.stream().map(this::mapToCardDto).collect(Collectors.toList()));
    }

    @PostMapping("/decks/{deckId:[0-9]+}/cards")
    public ResponseEntity<?> addCard(@PathVariable Long deckId, @RequestBody Flashcard card, Authentication auth, HttpServletRequest request) {
        Long userId = getUserIdFromAuth(auth, request);
        if (userId == null) return ResponseEntity.status(401).body("Unauthorized");

        Flashcard saved = flashcardService.addCard(userId, deckId, card.getCustomVocab(), card.getFrontText(), card.getBackText());
        return ResponseEntity.ok(mapToCardDto(saved));
    }

    @PutMapping("/cards/{id:[0-9]+}")
    public ResponseEntity<?> updateCard(@PathVariable Long id, @RequestBody FlashcardDto cardDto, Authentication auth, HttpServletRequest request) {
        Long userId = getUserIdFromAuth(auth, request);
        if (userId == null) return ResponseEntity.status(401).body("Unauthorized");

        Flashcard updated = flashcardService.updateCard(userId, id, cardDto.frontText, cardDto.backText);
        return ResponseEntity.ok(mapToCardDto(updated));
    }

    @DeleteMapping("/decks/{id:[0-9]+}")
    public ResponseEntity<?> deleteDeck(@PathVariable Long id, Authentication auth, HttpServletRequest request) {
        Long userId = getUserIdFromAuth(auth, request);
        if (userId == null) return ResponseEntity.status(401).body("Unauthorized");

        flashcardService.deleteDeck(userId, id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/cards/{id:[0-9]+}")
    public ResponseEntity<?> deleteCard(@PathVariable Long id, Authentication auth, HttpServletRequest request) {
        Long userId = getUserIdFromAuth(auth, request);
        if (userId == null) return ResponseEntity.status(401).body("Unauthorized");

        flashcardService.deleteCard(userId, id);
        return ResponseEntity.ok().build();
    }

    private FlashcardDto.FolderDto mapToFolderDto(Long userId, FlashcardFolder folder) {
        FlashcardDto.FolderDto dto = new FlashcardDto.FolderDto();
        dto.id = folder.getId();
        dto.name = folder.getName();
        if (folder.getDecks() != null) {
            dto.decks = folder.getDecks().stream().map(d -> mapToDeckDto(userId, d)).collect(Collectors.toList());
        }
        return dto;
    }

    private FlashcardDto.DeckDto mapToDeckDto(Long userId, FlashcardDeck deck) {
        FlashcardDto.DeckDto dto = new FlashcardDto.DeckDto();
        dto.id = deck.getId();
        dto.name = deck.getName();
        dto.description = deck.getDescription();
        dto.folderId = deck.getFolder() != null ? deck.getFolder().getId() : null;
        dto.cardCount = (int) flashcardService.countCards(userId, deck.getId());
        dto.updatedAt = deck.getUpdatedAt();
        return dto;
    }

    private FlashcardDto mapToCardDto(Flashcard card) {
        FlashcardDto dto = new FlashcardDto();
        dto.id = card.getId();
        dto.deckId = card.getDeck().getId();
        dto.frontText = card.getFrontText();
        dto.backText = card.getBackText();
        dto.createdAt = card.getCreatedAt();

        if (card.getCustomVocab() != null) {
            dto.originalWord = card.getCustomVocab().word;
            dto.meaningVi = card.getCustomVocab().meaningVi;
            dto.pronunciation = card.getCustomVocab().pronunciation;
        }
        return dto;
    }
}
