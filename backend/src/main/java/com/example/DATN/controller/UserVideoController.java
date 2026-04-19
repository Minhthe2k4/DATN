package com.example.DATN.controller;

import com.example.DATN.dto.UserVideoChannelDto;
import com.example.DATN.dto.UserVideoDto;
import com.example.DATN.dto.VideoChannelWithVideosDto;
import com.example.DATN.service.UserVideoService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * API công khai cho người dùng xem video
 * Không yêu cầu quyền admin
 */
@RestController
@RequestMapping("/api/videos")
public class UserVideoController {
    private final UserVideoService videoService;

    public UserVideoController(UserVideoService videoService) {
        this.videoService = videoService;
    }

    /**
     * Lấy tất cả kênh video
     * GET /api/videos/channels
     */
    @GetMapping("/channels")
    public List<UserVideoChannelDto> getAllChannels() {
        return videoService.getAllChannels();
    }

    /**
     * Lấy chi tiết kênh và danh sách video thuộc kênh
     * GET /api/videos/channels/{channelId}
     */
    @GetMapping("/channels/{channelId}")
    public VideoChannelWithVideosDto getChannelWithVideos(
            @PathVariable Long channelId) {
        return videoService.getChannelWithVideos(channelId);
    }

    /**
     * Lấy tất cả video
     * GET /api/videos
     */
    @GetMapping
    public List<UserVideoDto> getAllVideos() {
        return videoService.getAllVideos();
    }

    /**
     * Lấy thông tin video theo ID
     * GET /api/videos/{videoId}
     */
    @GetMapping("/{videoId}")
    public UserVideoDto getVideoById(@PathVariable Long videoId) {
        return videoService.getVideoById(videoId);
    }


}
