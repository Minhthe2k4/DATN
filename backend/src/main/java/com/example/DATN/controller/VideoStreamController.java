package com.example.DATN.controller;

import com.example.DATN.entity.Video;
import com.example.DATN.repository.VideoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

/**
 * Controller phục vụ URL video để frontend play.
 *
 * Vì video đã được lưu trên Cloudinary, chúng ta chỉ cần redirect
 * trình duyệt đến Cloudinary URL — không cần stream file từ server.
 *
 * Endpoint: GET /api/videos/{id}/stream
 */
@RestController
@RequestMapping("/api/videos")
public class VideoStreamController {

    private final VideoRepository videoRepository;

    public VideoStreamController(VideoRepository videoRepository) {
        this.videoRepository = videoRepository;
    }

    /**
     * Trả về Cloudinary URL của video.
     * Frontend dùng: <video src="http://localhost:8080/api/videos/123/stream">
     *
     * Server redirect đến Cloudinary URL (HTTP 302).
     * Trình duyệt sẽ tự phát video từ Cloudinary CDN.
     */
    @GetMapping("/{id}/stream")
    public ResponseEntity<Void> streamVideo(@PathVariable Long id) {
        Video video = videoRepository.findById(id).orElse(null);

        if (video == null || video.filePath == null || video.filePath.isBlank()) {
            return ResponseEntity.notFound().build();
        }

        // Redirect trình duyệt đến Cloudinary URL
        // Cloudinary tự handle streaming, CDN, và hỗ trợ Range Requests
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(video.filePath))
                .build();
    }
}
