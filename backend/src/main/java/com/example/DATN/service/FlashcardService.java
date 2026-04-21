package com.example.DATN.service;

import com.example.DATN.entity.*;
import com.example.DATN.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Date;
import java.util.List;
import java.util.Objects;

@Service
public class FlashcardService {

    @Autowired
    private FlashcardFolderRepository folderRepository;

    @Autowired
    private FlashcardDeckRepository deckRepository;

    @Autowired
    private FlashcardRepository cardRepository;

    @Autowired
    private PremiumService premiumService;

    // --- Folders ---
    public List<FlashcardFolder> getFolders(Long userId) {
        return folderRepository.findByUserId(userId);
    }

    public FlashcardFolder createFolder(Long userId, String name) {
        FlashcardFolder folder = new FlashcardFolder();
        User user = new User();
        user.id = userId;
        folder.setUser(user);
        folder.setName(name);
        return folderRepository.save(folder);
    }

    public FlashcardFolder updateFolder(Long userId, Long folderId, String name) {
        FlashcardFolder folder = folderRepository.findById(folderId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Folder not found"));
        if (folder.getUser() == null || !Objects.equals(folder.getUser().id, userId)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unauthorized");
        folder.setName(name);
        return folderRepository.save(folder);
    }

    public void deleteFolder(Long userId, Long folderId) {
        FlashcardFolder folder = folderRepository.findById(folderId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Folder not found"));
        if (folder.getUser() == null || !Objects.equals(folder.getUser().id, userId)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unauthorized");
        folderRepository.delete(folder);
    }

    // --- Decks ---
    public List<FlashcardDeck> getDecks(Long userId) {
        return deckRepository.findByUserId(userId);
    }

    public FlashcardDeck createDeck(Long userId, Long folderId, String name, String description) {
        // Check Limit
        int limit = premiumService.getFeatureLimit(userId, PremiumService.FEATURE_FLASHCARD_DECKS, 2);
        long currentCount = deckRepository.countByUserId(userId);
        if (currentCount >= limit) {
            throw new ResponseStatusException(HttpStatus.PAYMENT_REQUIRED, 
                "Bạn đã đạt giới hạn số lượng bộ thẻ (" + limit + "). Vui lòng nâng cấp Premium!");
        }

        FlashcardDeck deck = new FlashcardDeck();
        User user = new User();
        user.id = userId;
        deck.setUser(user);
        deck.setName(name);
        deck.setDescription(description);

        if (folderId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mọi bộ thẻ phải nằm trong một thư mục!");
        }

        FlashcardFolder folder = folderRepository.findById(folderId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Thư mục không tồn tại"));
        
        if (folder.getUser() == null || !Objects.equals(folder.getUser().getId(), userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền truy cập thư mục này");
        }

        deck.setFolder(folder);

        return deckRepository.save(deck);
    }

    public FlashcardDeck updateDeck(Long userId, Long deckId, Long folderId, String name, String description) {
        FlashcardDeck deck = deckRepository.findById(deckId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Deck not found"));
        if (deck.getUser() == null || !Objects.equals(deck.getUser().id, userId)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unauthorized");
        
        deck.setName(name);
        deck.setDescription(description);
        if (folderId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mọi bộ thẻ phải nằm trong một thư mục!");
        }

        FlashcardFolder folder = folderRepository.findById(folderId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Thư mục không tồn tại"));

        if (folder.getUser() == null || !Objects.equals(folder.getUser().getId(), userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền truy cập thư mục này");
        }

        deck.setFolder(folder);
        deck.setUpdatedAt(new Date());
        return deckRepository.save(deck);
    }

    // --- Cards ---
    public List<Flashcard> getCards(Long userId, Long deckId) {
        FlashcardDeck deck = deckRepository.findById(deckId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy bộ thẻ"));
        
        if (deck.getUser() == null || !Objects.equals(deck.getUser().getId(), userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền truy cập bộ thẻ này");
        }
        return cardRepository.findByDeckId(deckId);
    }

    public long countCards(Long userId, Long deckId) {
        return cardRepository.countByDeckId(deckId);
    }

    public Flashcard addCard(Long userId, Long deckId, UserVocabularyCustom customVocab, String front, String back) {
        FlashcardDeck deck = deckRepository.findById(deckId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Deck not found"));
        if (deck.getUser() == null || !Objects.equals(deck.getUser().id, userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unauthorized");
        }

        // Check Limit
        int limit = premiumService.getFeatureLimit(userId, PremiumService.FEATURE_FLASHCARDS_PER_DECK, 20);
        long currentCount = cardRepository.countByDeckId(deckId);
        if (currentCount >= limit) {
            throw new ResponseStatusException(HttpStatus.PAYMENT_REQUIRED, 
                "Bộ thẻ này đã đạt giới hạn số lượng thẻ (" + limit + "). Vui lòng nâng cấp Premium!");
        }

        Flashcard card = new Flashcard();
        card.setDeck(deck);
        card.setCustomVocab(customVocab);
        card.setFrontText(front);
        card.setBackText(back);

        deck.setUpdatedAt(new Date());
        deckRepository.save(deck);

        return cardRepository.save(card);
    }

    public Flashcard updateCard(Long userId, Long cardId, String front, String back) {
        Flashcard card = cardRepository.findById(cardId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Card not found"));
        if (card.getDeck() == null || card.getDeck().getUser() == null || !Objects.equals(card.getDeck().getUser().id, userId)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unauthorized");
        
        card.setFrontText(front);
        card.setBackText(back);
        return cardRepository.save(card);
    }

    public void deleteDeck(Long userId, Long deckId) {
        FlashcardDeck deck = deckRepository.findById(deckId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Deck not found"));
        if (deck.getUser() == null || !Objects.equals(deck.getUser().id, userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unauthorized");
        }
        deckRepository.delete(deck);
    }

    public void deleteCard(Long userId, Long cardId) {
        Flashcard card = cardRepository.findById(cardId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Card not found"));
        if (card.getDeck() == null || card.getDeck().getUser() == null || !Objects.equals(card.getDeck().getUser().id, userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Unauthorized");
        }
        cardRepository.delete(card);
    }
}
