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

@RestController
@RequestMapping("/api/admin")
public class AdminReadingController {
    private final AdminReadingService adminReadingService;

    public AdminReadingController(AdminReadingService adminReadingService) {
        this.adminReadingService = adminReadingService;
    }

    @GetMapping("/readings")
    public List<AdminReadingArticleDto> findAllArticles() {
        return adminReadingService.findAllArticles();
    }

    @PostMapping("/readings")
    @ResponseStatus(HttpStatus.CREATED)
    public AdminReadingArticleDto createArticle(@RequestBody UpsertReadingArticleRequest request) {
        return adminReadingService.createArticle(request);
    }

    @PutMapping("/readings/{id}")
    public AdminReadingArticleDto updateArticle(@PathVariable Long id,
            @RequestBody UpsertReadingArticleRequest request) {
        return adminReadingService.updateArticle(id, request);
    }

    @PostMapping("/readings/crawl")
    public CrawlReadingArticleResponse crawlArticle(@RequestBody CrawlReadingArticleRequest request) {
        return adminReadingService.crawlArticle(request);
    }

    @DeleteMapping("/readings/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteArticle(
            @PathVariable Long id,
            @org.springframework.web.bind.annotation.RequestParam(required = false, defaultValue = "false") boolean force) {
        adminReadingService.deleteArticle(id, force);
    }

    @GetMapping("/reading-topics")
    public List<AdminReadingTopicDto> findAllTopics() {
        return adminReadingService.findAllTopics();
    }

    @PostMapping("/reading-topics")
    @ResponseStatus(HttpStatus.CREATED)
    public AdminReadingTopicDto createTopic(@RequestBody UpsertReadingTopicRequest request) {
        return adminReadingService.createTopic(request);
    }

    @PutMapping("/reading-topics/{id}")
    public AdminReadingTopicDto updateTopic(@PathVariable Long id, @RequestBody UpsertReadingTopicRequest request) {
        return adminReadingService.updateTopic(id, request);
    }

    @DeleteMapping("/reading-topics/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTopic(
            @PathVariable Long id,
            @org.springframework.web.bind.annotation.RequestParam(required = false, defaultValue = "false") boolean force) {
        adminReadingService.deleteTopic(id, force);
    }

    @GetMapping("/readings/deleted")
    public List<ArticleManagementProjection> getDeletedArticles() {
        return adminReadingService.getDeletedArticles();
    }

    @GetMapping("/readings/{id}")
    public AdminReadingArticleDto findArticleById(@PathVariable Long id) {
        return adminReadingService.findArticleById(id);
    }

    @PatchMapping("/readings/{id}/restore")
    public void restoreArticle(@PathVariable Long id) {
        adminReadingService.restoreArticle(id);
    }

    @GetMapping("/reading-topics/deleted")
    public List<ArticleTopicManagementProjection> getDeletedTopics() {
        return adminReadingService.getDeletedTopics();
    }

    @GetMapping("/reading-topics/{id}")
    public AdminReadingTopicDto findTopicById(@PathVariable Long id) {
        return adminReadingService.findTopicById(id);
    }

    @PatchMapping("/reading-topics/{id}/restore")
    public void restoreTopic(@PathVariable Long id) {
        adminReadingService.restoreTopic(id);
    }
}
