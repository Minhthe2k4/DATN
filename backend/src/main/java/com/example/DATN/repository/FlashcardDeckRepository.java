package com.example.DATN.repository;

import com.example.DATN.entity.FlashcardDeck;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FlashcardDeckRepository extends JpaRepository<FlashcardDeck, Long> {
    List<FlashcardDeck> findByUserId(Long userId);
    List<FlashcardDeck> findByFolderId(Long folderId);
    long countByUserId(Long userId);
}
