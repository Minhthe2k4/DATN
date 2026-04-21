package com.example.DATN.repository;

import com.example.DATN.entity.FlashcardFolder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FlashcardFolderRepository extends JpaRepository<FlashcardFolder, Long> {
    List<FlashcardFolder> findByUserId(Long userId);
}
