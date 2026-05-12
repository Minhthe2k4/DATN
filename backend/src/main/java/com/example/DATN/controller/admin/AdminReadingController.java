package com.example.DATN.controller.admin;

import com.example.DATN.dto.admin.AdminReadingArticleDto;
import com.example.DATN.dto.admin.AdminReadingTopicDto;
import com.example.DATN.dto.admin.CrawlReadingArticleRequest;
import com.example.DATN.dto.admin.CrawlReadingArticleResponse;
import com.example.DATN.dto.admin.UpsertReadingArticleRequest;
import com.example.DATN.dto.admin.UpsertReadingTopicRequest;
import com.example.DATN.repository.projections.ArticleManagementProjection;
import com.example.DATN.repository.projections.ArticleTopicManagementProjection;
import com.example.DATN.service.admin.AdminReadingService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

// Controller quản lý nội dung bài đọc và chủ đề bài đọc dành cho Admin.
@RestController
@RequestMapping("/api/admin")
public class AdminReadingController {
    private final AdminReadingService adminReadingService;

    public AdminReadingController(AdminReadingService adminReadingService) {
        this.adminReadingService = adminReadingService;
    }

    // Lấy danh sách toàn bộ bài báo.
    @GetMapping("/readings")
    public List<AdminReadingArticleDto> findAllArticles() {
        return adminReadingService.findAllArticles();
    }

    // Tạo mới một bài báo.
    @PostMapping("/readings")
    @ResponseStatus(HttpStatus.CREATED)
    public AdminReadingArticleDto createArticle(@RequestBody UpsertReadingArticleRequest request) {
        return adminReadingService.createArticle(request);
    }

    // Cập nhật bài báo hiện có.
    @PutMapping("/readings/{id}")
    public AdminReadingArticleDto updateArticle(@PathVariable Long id,
            @RequestBody UpsertReadingArticleRequest request) {
        return adminReadingService.updateArticle(id, request);
    }

    // Thu thập nội dung bài báo tự động từ nguồn bên ngoài (Crawl).
    @PostMapping("/readings/crawl")
    public CrawlReadingArticleResponse crawlArticle(@RequestBody CrawlReadingArticleRequest request) {
        return adminReadingService.crawlArticle(request);
    }

    // Xóa bài báo (Xóa vĩnh viễn hoặc xóa mềm).
    @DeleteMapping("/readings/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteArticle(
            @PathVariable Long id,
            @org.springframework.web.bind.annotation.RequestParam(required = false, defaultValue = "false") boolean force) {
        adminReadingService.deleteArticle(id, force);
    }

    // Lấy danh sách toàn bộ chủ đề bài đọc.
    @GetMapping("/reading-topics")
    public List<AdminReadingTopicDto> findAllTopics() {
        return adminReadingService.findAllTopics();
    }

    // Tạo mới một chủ đề bài đọc.
    @PostMapping("/reading-topics")
    @ResponseStatus(HttpStatus.CREATED)
    public AdminReadingTopicDto createTopic(@RequestBody UpsertReadingTopicRequest request) {
        return adminReadingService.createTopic(request);
    }

    // Cập nhật chủ đề bài báo.
    @PutMapping("/reading-topics/{id}")
    public AdminReadingTopicDto updateTopic(@PathVariable Long id, @RequestBody UpsertReadingTopicRequest request) {
        return adminReadingService.updateTopic(id, request);
    }

    // Xóa chủ đề bài báo.
    @DeleteMapping("/reading-topics/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTopic(
            @PathVariable Long id,
            @org.springframework.web.bind.annotation.RequestParam(required = false, defaultValue = "false") boolean force) {
        adminReadingService.deleteTopic(id, force);
    }

    // Lấy danh sách bài báo đã xóa (Thùng rác).
    @GetMapping("/readings/deleted")
    public List<ArticleManagementProjection> getDeletedArticles() {
        return adminReadingService.getDeletedArticles();
    }

    // Xem chi tiết một bài báo theo ID.
    @GetMapping("/readings/{id}")
    public AdminReadingArticleDto findArticleById(@PathVariable Long id) {
        return adminReadingService.findArticleById(id);
    }

    // Khôi phục bài báo đã bị xóa.
    @PatchMapping("/readings/{id}/restore")
    public void restoreArticle(@PathVariable Long id) {
        adminReadingService.restoreArticle(id);
    }

    // Lấy danh sách các chủ đề bài đọc đã xóa.
    @GetMapping("/reading-topics/deleted")
    public List<ArticleTopicManagementProjection> getDeletedTopics() {
        return adminReadingService.getDeletedTopics();
    }

    // Xem chi tiết một chủ đề bài đọc theo ID.
    @GetMapping("/reading-topics/{id}")
    public AdminReadingTopicDto findTopicById(@PathVariable Long id) {
        return adminReadingService.findTopicById(id);
    }

    // Khôi phục chủ đề bài đọc đã xóa.
    @PatchMapping("/reading-topics/{id}/restore")
    public void restoreTopic(@PathVariable Long id) {
        adminReadingService.restoreTopic(id);
    }
}
