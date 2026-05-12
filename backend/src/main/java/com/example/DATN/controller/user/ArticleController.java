package com.example.DATN.controller.user;

import com.example.DATN.dto.user.ReadingWordLookupRequest;
import com.example.DATN.dto.user.ReadingWordLookupResponse;
import com.example.DATN.dto.user.SaveReadingWordRequest;
import com.example.DATN.dto.user.UserReadingArticleDto;
import com.example.DATN.dto.user.UserReadingTopicDto;
import com.example.DATN.service.user.ArticleService;
import com.example.DATN.service.user.PremiumService;
import com.example.DATN.service.user.ReadingDictionaryService;
import java.util.Date;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/article")
public class ArticleController {

    @Autowired
    private ArticleService articleService;

    @Autowired
    private ReadingDictionaryService readingDictionaryService;

    @Autowired
    private PremiumService premiumService;

    // Lấy danh sách chủ đề bài báo cho user
    @GetMapping("/topics")
    public List<UserReadingTopicDto> getAllTopics() {
        return articleService.getAllTopics();
    }

    // Lấy danh sách bài báo theo topicId
    @GetMapping("/list")
    public List<UserReadingArticleDto> getArticlesByTopic(@RequestParam(required = false) Long topicId) {
        return articleService.getArticlesByTopic(topicId);
    }

    // 1. Nhận từ vựng và câu ngữ cảnh từ Frontend.
    // 2. Sử dụng ReadingDictionaryService để tra cứu (có thể qua Cache, Local DB
    // hoặc AI).
    @PostMapping("/lookup-word")
    public ReadingWordLookupResponse lookupWord(@RequestBody ReadingWordLookupRequest request) {
        return readingDictionaryService.lookupWord(
                request.word(),
                request.sentence(),
                request.userId(),
                request.articleId(),
                request.forceRefresh());
    }

    // Khi người dùng bấm "Lưu từ", hệ thống sẽ lưu vào bảng UserVocabularyCustom
    // và đồng thời khởi tạo lộ trình ôn tập SRS (Thời điểm vàng).
    @PostMapping("/save-word")
    public com.example.DATN.entity.UserVocabularyCustom saveWord(@RequestBody SaveReadingWordRequest request) {
        return readingDictionaryService.saveWordToPersonalVocabulary(request);
    }

    // Chi tiết bài báo
    @GetMapping("/{articleId:[0-9]+}")
    public UserReadingArticleDto getArticleById(@PathVariable Long articleId) {
        return articleService.getArticleById(articleId);
    }

    @PostMapping("/{articleId:[0-9]+}/check-download-limit")
    public void checkDownloadLimit(@PathVariable Long articleId, @RequestParam Long userId) {
        premiumService.checkAndIncrementDownloadLimit(userId);
    }
}
