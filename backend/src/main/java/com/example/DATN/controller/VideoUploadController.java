package com.example.DATN.controller;

import com.example.DATN.service.VideoUploadService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/**
 * Controller xử lý upload video từ admin.
 *
 * Endpoints:
 *   POST /api/admin/videos/upload-url    — nhập YouTube URL, hệ thống tự download
 *   POST /api/admin/videos/upload-file   — upload file video từ máy tính
 *   GET  /api/admin/videos/{id}/status   — kiểm tra trạng thái tạo phụ đề
 */
@RestController
@RequestMapping("/api/admin")
public class VideoUploadController {

    private final VideoUploadService videoUploadService;

    public VideoUploadController(VideoUploadService videoUploadService) {
        this.videoUploadService = videoUploadService;
    }

    /**
     * [LUỒNG 1 — Đơn giản hơn, phù hợp đồ án]
     * Admin nhập YouTube URL → hệ thống tự download bằng yt-dlp → upload Cloudinary → Whisper tạo phụ đề.
     *
     * Request: JSON { "title": "...", "channelId": 1, "youtubeUrl": "https://youtu.be/..." }
     * Response: { "videoId": 123 }
     */
    @PostMapping("/videos/upload-url")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Long> uploadFromYoutubeUrl(@RequestBody Map<String, Object> body)
            throws IOException, InterruptedException {
        String title = (String) body.get("title");
        Long channelId = Long.valueOf(body.get("channelId").toString());
        String youtubeUrl = (String) body.get("youtubeUrl");
        String difficulty = (String) body.getOrDefault("difficulty", "All");
        String status = (String) body.getOrDefault("status", "Công khai");

        Long videoId = videoUploadService.uploadFromYoutubeUrl(title, channelId, youtubeUrl, difficulty, status);
        return Map.of("videoId", videoId);
    }

    /**
     * [LUỒNG 2 — Upload file từ máy tính]
     * Admin chọn file video → upload lên Cloudinary → Whisper tạo phụ đề.
     *
     * Request: multipart/form-data (title, channelId, file)
     * Response: { "videoId": 123 }
     */
    @PostMapping("/videos/upload-file")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Long> uploadFromFile(
            @RequestParam("title") String title,
            @RequestParam("channelId") Long channelId,
            @RequestParam(value = "difficulty", defaultValue = "All") String difficulty,
            @RequestParam(value = "status", defaultValue = "Công khai") String status,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        Long videoId = videoUploadService.uploadFromFile(title, channelId, file, difficulty, status);
        return Map.of("videoId", videoId);
    }

    /**
     * Kiểm tra trạng thái tạo phụ đề (frontend polling mỗi 3 giây).
     * Response: { "status": "PROCESSING" | "DONE" | "ERROR" }
     */
    @GetMapping("/videos/{id}/status")
    public Map<String, String> getSubtitleStatus(@PathVariable Long id) {
        return Map.of("status", videoUploadService.getSubtitleStatus(id));
    }
}
