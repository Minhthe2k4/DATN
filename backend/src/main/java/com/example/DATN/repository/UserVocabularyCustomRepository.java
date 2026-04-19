package com.example.DATN.repository;

import com.example.DATN.entity.UserVocabularyCustom;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserVocabularyCustomRepository extends JpaRepository<UserVocabularyCustom, Long> {
    boolean existsByUser_IdAndWordIgnoreCase(Long userId, String word);
    List<UserVocabularyCustom> findByUser_IdOrderByCreatedAtDesc(Long userId);
    long countByUser_Id(Long userId);
}
