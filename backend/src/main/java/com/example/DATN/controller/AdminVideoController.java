package com.example.DATN.controller;

import com.example.DATN.dto.AdminVideoChannelDto;
import com.example.DATN.dto.AdminVideoDto;
import com.example.DATN.dto.TranscriptResponseDto;
import com.example.DATN.dto.UpsertVideoChannelRequest;
import com.example.DATN.dto.UpsertVideoRequest;
import com.example.DATN.service.AdminVideoService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminVideoController {
    private final AdminVideoService adminVideoService;

    public AdminVideoController(AdminVideoService adminVideoService) {
        this.adminVideoService = adminVideoService;
    }

    @GetMapping("/video-channels")
    public List<AdminVideoChannelDto> findAllChannels() {
        return adminVideoService.findAllChannels();
    }

    @GetMapping("/video-channels/{id}")
    public AdminVideoChannelDto findChannelById(@PathVariable Long id) {
        return adminVideoService.findChannelById(id);
    }

    @PostMapping("/video-channels")
    @ResponseStatus(HttpStatus.CREATED)
    public AdminVideoChannelDto createChannel(@RequestBody UpsertVideoChannelRequest request) {
        return adminVideoService.createChannel(request);
    }

    @PutMapping("/video-channels/{id}")
    public AdminVideoChannelDto updateChannel(@PathVariable Long id, @RequestBody UpsertVideoChannelRequest request) {
        return adminVideoService.updateChannel(id, request);
    }

    @DeleteMapping("/video-channels/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteChannel(@PathVariable Long id) {
        adminVideoService.deleteChannel(id);
    }

    @GetMapping("/videos")
    public List<AdminVideoDto> findAllVideos() {
        return adminVideoService.findAllVideos();
    }

    @GetMapping("/videos/{id}")
    public AdminVideoDto findVideoById(@PathVariable Long id) {
        return adminVideoService.findVideoById(id);
    }

    @PostMapping("/videos")
    @ResponseStatus(HttpStatus.CREATED)
    public AdminVideoDto createVideo(@RequestBody UpsertVideoRequest request) {
        return adminVideoService.createVideo(request);
    }

    @PutMapping("/videos/{id}")
    public AdminVideoDto updateVideo(@PathVariable Long id, @RequestBody UpsertVideoRequest request) {
        return adminVideoService.updateVideo(id, request);
    }

    @DeleteMapping("/videos/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteVideo(@PathVariable Long id) {
        adminVideoService.deleteVideo(id);
    }

    /**
     * Fetch captions từ YouTube video
     * POST /api/admin/videos/fetch-captions
     * Request body: { "youtubeUrl": "..." }
     * 
     * Response:
     * {
     *   "videoId": "...",
     *   "title": "...",
     *   "transcript": "full text...",
     *   "segments": [
     *     { "startSec": 0.5, "endSec": 3.2, "text": "...", "segmentOrder": 1 },
     *     ...
     *   ],
     *   "language": "ko",
     *   "sourceUrl": "...",
     *   "error": null
     * }
     */
    @PostMapping("/videos/fetch-captions")
    public TranscriptResponseDto fetchCaptions(@RequestBody CaptionRequest request) {
        return adminVideoService.fetchYouTubeCaptions(request.youtubeUrl());
    }

    public record CaptionRequest(String youtubeUrl) {}
}

