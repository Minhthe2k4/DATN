package com.example.DATN.controller;

import com.example.DATN.dto.UserVideoChannelDto;
import com.example.DATN.dto.UserVideoDto;
import com.example.DATN.dto.VideoChannelWithVideosDto;
import com.example.DATN.entity.Segment;
import com.example.DATN.repository.SegmentRepository;
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
    private final SegmentRepository segmentRepository;

    public UserVideoController(UserVideoService videoService, SegmentRepository segmentRepository) {
        this.videoService = videoService;
        this.segmentRepository = segmentRepository;
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
     * GET /api/user/videos/{videoId}
     */
    @GetMapping("/{videoId}")
    public UserVideoDto getVideoById(@PathVariable Long videoId) {
        return videoService.getVideoById(videoId);
    }

    /**
     * Lấy danh sách phụ đề (segments) của video
     * GET /api/user/videos/{videoId}/segments
     * Frontend dùng để hiển thị phụ đề đồng bộ khi xem video
     */
    @GetMapping("/{videoId}/segments")
    public List<Segment> getVideoSegments(@PathVariable Long videoId) {
        return segmentRepository.findByVideoIdOrderBySegmentOrderAsc(videoId);
    }

    @org.springframework.web.bind.annotation.PostMapping("/lookup-word")
    public com.example.DATN.dto.ReadingWordLookupResponse lookupWord(@org.springframework.web.bind.annotation.RequestBody com.example.DATN.dto.ReadingWordLookupRequest request) {
        // reuse ReadingDictionaryService for video context
        return videoService.lookupWordInVideo(request);
    }

    @org.springframework.web.bind.annotation.PostMapping("/save-word")
    public com.example.DATN.entity.UserVocabularyCustom saveWord(@org.springframework.web.bind.annotation.RequestBody com.example.DATN.dto.SaveReadingWordRequest request) {
        return videoService.saveWordFromVideo(request);
    }
}
