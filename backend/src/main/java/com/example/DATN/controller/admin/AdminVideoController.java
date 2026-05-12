package com.example.DATN.controller.admin;

import com.example.DATN.dto.admin.AdminVideoChannelDto;
import com.example.DATN.dto.admin.AdminVideoDto;
import com.example.DATN.dto.user.TranscriptResponseDto;
import com.example.DATN.dto.admin.UpsertVideoChannelRequest;
import com.example.DATN.dto.admin.UpsertVideoRequest;
import com.example.DATN.repository.projections.VideoManagementProjection;
import com.example.DATN.repository.projections.YouTubeChannelManagementProjection;
import com.example.DATN.service.admin.AdminVideoService;
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

// Controller quản lý kho Video và các kênh YouTube dành cho Admin.
@RestController
@RequestMapping("/api/admin")
public class AdminVideoController {
    private final AdminVideoService adminVideoService;

    public AdminVideoController(AdminVideoService adminVideoService) {
        this.adminVideoService = adminVideoService;
    }

    // Lấy danh sách toàn bộ kênh YouTube trong hệ thống.
    @GetMapping("/video-channels")
    public List<AdminVideoChannelDto> findAllChannels() {
        return adminVideoService.findAllChannels();
    }

    // Thêm mới một kênh YouTube.
    @PostMapping("/video-channels")
    @ResponseStatus(HttpStatus.CREATED)
    public AdminVideoChannelDto createChannel(@RequestBody UpsertVideoChannelRequest request) {
        return adminVideoService.createChannel(request);
    }

    // Cập nhật thông tin kênh.
    @PutMapping("/video-channels/{id}")
    public AdminVideoChannelDto updateChannel(@PathVariable Long id, @RequestBody UpsertVideoChannelRequest request) {
        return adminVideoService.updateChannel(id, request);
    }

    // Xóa kênh (Xóa vĩnh viễn hoặc xóa mềm).
    @DeleteMapping("/video-channels/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteChannel(
            @PathVariable Long id,
            @org.springframework.web.bind.annotation.RequestParam(required = false, defaultValue = "false") boolean force) {
        adminVideoService.deleteChannel(id, force);
    }

    // Lấy danh sách toàn bộ video.
    @GetMapping("/videos")
    public List<AdminVideoDto> findAllVideos() {
        return adminVideoService.findAllVideos();
    }

    // Tạo mới một video học tập.
    @PostMapping("/videos")
    @ResponseStatus(HttpStatus.CREATED)
    public AdminVideoDto createVideo(@RequestBody UpsertVideoRequest request) {
        return adminVideoService.createVideo(request);
    }

    // Cập nhật thông tin video.
    @PutMapping("/videos/{id}")
    public AdminVideoDto updateVideo(@PathVariable Long id, @RequestBody UpsertVideoRequest request) {
        return adminVideoService.updateVideo(id, request);
    }

    // Xóa video.
    @DeleteMapping("/videos/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteVideo(
            @PathVariable Long id,
            @org.springframework.web.bind.annotation.RequestParam(required = false, defaultValue = "false") boolean force) {
        adminVideoService.deleteVideo(id, force);
    }

    // Tự động lấy phụ đề (Captions) từ link YouTube.
    // Hỗ trợ Admin không phải nhập liệu phụ đề thủ công cho các đoạn video.
    @PostMapping("/videos/fetch-captions")
    public TranscriptResponseDto fetchCaptions(@RequestBody CaptionRequest request) {
        return adminVideoService.fetchYouTubeCaptions(request.youtubeUrl());
    }

    @GetMapping("/videos/deleted")
    public List<VideoManagementProjection> getDeletedVideos() {
        return adminVideoService.getDeletedVideos();
    }

    @GetMapping("/videos/{id}")
    public AdminVideoDto findVideoById(@PathVariable Long id) {
        return adminVideoService.findVideoById(id);
    }

    // Tự động lấy thông tin kênh YouTube từ URL.
    @PostMapping("/video-channels/fetch-info")
    public java.util.Map<String, String> fetchChannelInfo(@RequestBody CaptionRequest request) {
        return adminVideoService.fetchChannelInfo(request.youtubeUrl());
    }

    public record CaptionRequest(String youtubeUrl) {
    }

    // Lấy danh sách các kênh đã xóa (Thùng rác).
    @GetMapping("/video-channels/deleted")
    public List<YouTubeChannelManagementProjection> getDeletedChannels() {
        return adminVideoService.getDeletedChannels();
    }

    // Xem chi tiết một kênh YouTube theo ID.
    @GetMapping("/video-channels/{id}")
    public AdminVideoChannelDto findChannelById(@PathVariable Long id) {
        return adminVideoService.findChannelById(id);
    }

    // Khôi phục video đã bị xóa.
    @PatchMapping("/videos/{id}/restore")
    public void restoreVideo(@PathVariable Long id) {
        adminVideoService.restoreVideo(id);
    }

    // Khôi phục kênh YouTube đã bị xóa.
    @PatchMapping("/video-channels/{id}/restore")
    public void restoreChannel(@PathVariable Long id) {
        adminVideoService.restoreChannel(id);
    }
}
