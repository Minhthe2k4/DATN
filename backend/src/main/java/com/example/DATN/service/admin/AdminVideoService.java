package com.example.DATN.service.admin;

import com.example.DATN.dto.admin.*;
import com.example.DATN.dto.user.TranscriptResponseDto;
import com.example.DATN.dto.user.TranscriptSegmentDto;
import com.example.DATN.entity.Segment;
import com.example.DATN.entity.Video;
import com.example.DATN.entity.YouTubeChannel;
import com.example.DATN.repository.learning.SegmentRepository;
import com.example.DATN.repository.content.TopicRepository;
import com.example.DATN.repository.content.VideoRepository;
import com.example.DATN.repository.content.YouTubeChannelRepository;
import com.example.DATN.repository.projections.YouTubeChannelManagementProjection;
import com.example.DATN.repository.projections.VideoManagementProjection;
import com.example.DATN.util.YouTubeCaptionUtil;
import com.example.DATN.util.YouTubeTranscriptService;

import jakarta.transaction.Transactional;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

// Service quản lý nội dung Video và Kênh YouTube.
// Đảm nhiệm logic xử lý thông tin video, đồng bộ hóa phụ đề từ YouTube
// và quản lý các đoạn cắt (Segments) của video để phục vụ việc học tập.
@Service
public class AdminVideoService {
    private final VideoRepository videoRepository;
    private final YouTubeChannelRepository youTubeChannelRepository;

    public AdminVideoService(
            VideoRepository videoRepository,
            YouTubeChannelRepository youTubeChannelRepository,
            TopicRepository topicRepository,
            SegmentRepository segmentRepository) {
        this.videoRepository = videoRepository;
        this.youTubeChannelRepository = youTubeChannelRepository;
    }

    // Lấy danh sách toàn bộ các kênh video phục vụ trang quản lý.
    public List<AdminVideoChannelDto> findAllChannels() {
        return youTubeChannelRepository.findChannelManagementRows().stream().map(this::toChannelDto).toList();
    }

    // Xem chi tiết một kênh YouTube.
    public AdminVideoChannelDto findChannelById(Long id) {
        YouTubeChannel channel = youTubeChannelRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Channel not found"));

        long videoCount = videoRepository.findVideoManagementRows().stream()
                .filter(v -> id.equals(v.getChannelId()))
                .count();

        return new AdminVideoChannelDto(
                channel.id,
                defaultString(channel.name, ""),
                defaultString(channel.handle, ""),
                defaultString(channel.url, ""),
                defaultString(channel.description, ""),
                channel.subscriberCount != null ? channel.subscriberCount : 0,
                videoCount,
                normalizeChannelStatus(channel.status),
                defaultString(channel.avatar, ""),
                channel.createdAt,
                channel.updatedAt,
                channel.deletedAt);
    }

    // Tạo mới một kênh YouTube.
    public AdminVideoChannelDto createChannel(UpsertVideoChannelRequest request) {
        String name = request == null || request.name() == null ? "" : request.name().trim();
        if (youTubeChannelRepository.existsByNameIgnoreCase(name)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Tên này đã tồn tại, vui lòng chọn tên khác.");
        }
        YouTubeChannel channel = new YouTubeChannel();
        applyChannel(channel, request);
        YouTubeChannel saved = youTubeChannelRepository.save(channel);
        return findChannelById(saved.id);
    }

    // Cập nhật thông tin kênh YouTube.
    public AdminVideoChannelDto updateChannel(Long id, UpsertVideoChannelRequest request) {
        String name = request == null || request.name() == null ? "" : request.name().trim();
        if (youTubeChannelRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Tên này đã tồn tại, vui lòng chọn tên khác.");
        }
        YouTubeChannel channel = youTubeChannelRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Channel not found"));
        applyChannel(channel, request);
        youTubeChannelRepository.save(channel);
        return findChannelById(id);
    }

    // Xóa kênh YouTube (Xóa vĩnh viễn hoặc xóa mềm).
    public void deleteChannel(Long id, boolean force) {
        if (force) {
            youTubeChannelRepository.hardDelete(id);
        } else {
            YouTubeChannel channel = youTubeChannelRepository.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Channel not found"));
            channel.status = "Tạm dừng"; // Soft delete
            channel.deletedAt = new Date();
            youTubeChannelRepository.save(channel);
        }
    }

    public List<AdminVideoDto> findAllVideos() {
        return videoRepository.findVideoManagementRows().stream().map(this::toVideoDto).toList();
    }

    public AdminVideoDto findVideoById(Long id) {
        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Video not found"));

        return new AdminVideoDto(
                video.id,
                defaultString(video.title, ""),
                defaultString(video.url, ""),
                video.channel == null ? null : video.channel.id,
                video.channel == null ? "" : defaultString(video.channel.name, ""),
                video.difficulty != null ? video.difficulty : "Trung bình",
                video.duration != null ? video.duration : "—",
                video.wordsHighlighted != null ? video.wordsHighlighted : 0,
                video.status != null ? video.status : "Chờ biên tập",
                video.thumbnail != null ? video.thumbnail : "",
                video.filePath != null ? video.filePath : "",
                video.subtitleStatus != null ? video.subtitleStatus : "PENDING",
                video.createdAt,
                video.updatedAt,
                video.deletedAt,
                video.views == null ? 0 : video.views);
    }

    public AdminVideoDto createVideo(UpsertVideoRequest request) {
        String title = request == null || request.title() == null ? "" : request.title().trim();
        if (videoRepository.existsByTitleIgnoreCase(title)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Tiêu đề này đã tồn tại, vui lòng chọn tên khác.");
        }
        Video video = new Video();
        applyVideo(video, request);
        Video saved = videoRepository.save(video);
        return findVideoById(saved.id);
    }

    public AdminVideoDto updateVideo(Long id, UpsertVideoRequest request) {
        String title = request == null || request.title() == null ? "" : request.title().trim();
        if (videoRepository.existsByTitleIgnoreCaseAndIdNot(title, id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Tiêu đề này đã tồn tại, vui lòng chọn tên khác.");
        }
        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Video not found"));
        applyVideo(video, request);
        videoRepository.save(video);
        return findVideoById(id);
    }

    public void deleteVideo(Long id, boolean force) {
        if (force) {
            videoRepository.hardDelete(id);
        } else {
            Video video = videoRepository.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Video not found"));
            video.status = "Nháp"; // Soft delete
            video.deletedAt = new Date();
            videoRepository.save(video);
        }
    }

    private void applyChannel(YouTubeChannel channel, UpsertVideoChannelRequest request) {
        String name = request == null ? "" : defaultString(request.name(), "").trim();
        if (name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Channel name is required");
        }

        channel.name = name;
        channel.handle = normalizeHandle(request == null ? null : request.handle());
        channel.url = defaultString(request == null ? null : request.url(), "").trim();
        channel.description = defaultString(request == null ? null : request.description(), "").trim();
        channel.subscriberCount = request == null ? 0 : request.subscriberCount();
        channel.avatar = request == null ? "" : defaultString(request.avatar(), "").trim();
        channel.status = normalizeChannelStatus(request == null ? "Hoạt động" : request.status());
    }

    private void applyVideo(Video video, UpsertVideoRequest request) {
        String title = request == null ? "" : defaultString(request.title(), "").trim();
        if (title.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Video title is required");
        }
        if (request == null || request.channelId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Video channel is required");
        }

        YouTubeChannel channel = youTubeChannelRepository.findById(request.channelId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Channel not found"));

        if (request.topicId() != null) {
        }

        video.title = title;
        String youtubeUrl = defaultString(request.youtubeUrl(), "").trim();
        video.url = youtubeUrl;
        video.channel = channel;

        // Lấy transcript từ request (admin tự nhập sau khi review)
        String transcript = request == null ? "" : defaultString(request.transcript(), "").trim();
        video.transcript = transcript;

        // Set default values if not provided
        video.difficulty = request == null ? "Trung bình" : defaultString(request.difficulty(), "Trung bình");
        video.duration = request == null ? "—" : defaultString(request.duration(), "—");
        video.wordsHighlighted = 0;
        video.status = request == null ? "Chờ biên tập" : defaultString(request.status(), "Chờ biên tập");
        video.thumbnail = request == null ? "" : defaultString(request.thumbnail(), "").trim();
        video.filePath = request == null ? "" : defaultString(request.filePath(), "").trim();
        video.subtitleStatus = request == null ? "PENDING" : defaultString(request.subtitleStatus(), "PENDING");

        // Handle segments if provided
        if (request != null && request.segments() != null && !request.segments().isEmpty()) {
            // Clear existing segments
            if (video.segments != null) {
                video.segments.clear();
            } else {
                video.segments = new ArrayList<>();
            }

            // Add new segments
            for (var segmentDto : request.segments()) {
                Segment segment = new Segment(
                        segmentDto.segmentOrder(),
                        segmentDto.startSec(),
                        segmentDto.endSec(),
                        segmentDto.text(),
                        video);
                video.segments.add(segment);
            }
        }
    }

    private AdminVideoChannelDto toChannelDto(YouTubeChannelManagementProjection row) {
        return new AdminVideoChannelDto(
                row.getId(),
                defaultString(row.getName(), ""),
                defaultString(row.getHandle(), ""),
                defaultString(row.getUrl(), ""),
                defaultString(row.getDescription(), ""),
                row.getSubscriberCount() == null ? 0 : row.getSubscriberCount(),
                row.getVideoCount() == null ? 0 : row.getVideoCount(),
                normalizeChannelStatus(row.getStatus()),
                row.getAvatar() != null ? row.getAvatar() : "",
                row.getCreatedAt(),
                row.getUpdatedAt(),
                row.getDeletedAt());
    }

    private String normalizeChannelStatus(String status) {
        String normalized = defaultString(status, "Hoạt động").trim().toLowerCase();
        if (normalized.equals("1") || normalized.equals("active") || normalized.equals("hoạt động")
                || normalized.equals("hoat dong")) {
            return "Hoạt động";
        }
        if (normalized.equals("0") || normalized.equals("paused") || normalized.equals("tạm dừng")
                || normalized.equals("tam dung")) {
            return "Tạm dừng";
        }
        return "Hoạt động";
    }

    private AdminVideoDto toVideoDto(VideoManagementProjection row) {
        return new AdminVideoDto(
                row.getId(),
                defaultString(row.getTitle(), ""),
                defaultString(row.getUrl(), ""),
                row.getChannelId(),
                defaultString(row.getChannelName(), ""),
                row.getDifficulty() != null ? row.getDifficulty() : "Trung bình",
                row.getDuration() != null ? row.getDuration() : "—",
                row.getWordsHighlighted() == null ? 0 : row.getWordsHighlighted(),
                row.getStatus() != null ? row.getStatus() : "Chờ biên tập",
                row.getThumbnail() != null ? row.getThumbnail() : "",
                row.getFilePath() != null ? row.getFilePath() : "",
                row.getSubtitleStatus() != null ? row.getSubtitleStatus() : "PENDING",
                row.getCreatedAt(),
                row.getUpdatedAt(),
                row.getDeletedAt(),
                row.getViews() == null ? 0 : row.getViews());
    }

    private String normalizeHandle(String value) {
        String handle = defaultString(value, "").trim();
        if (handle.isBlank()) {
            return "";
        }
        return handle.startsWith("@") ? handle : "@" + handle;
    }

    // private String extractHandle(String url) {
    // String normalizedUrl = defaultString(url, "").trim();
    // int idx = normalizedUrl.lastIndexOf('/');
    // if (idx >= 0 && idx + 1 < normalizedUrl.length()) {
    // String suffix = normalizedUrl.substring(idx + 1);
    // return normalizeHandle(suffix);
    // }
    // return "";
    // }

    private String defaultString(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value;
    }

    // Tự động lấy phụ đề (Captions) và thông tin metadata từ YouTube video.
    // Kết nối với YouTube API/Scraper để lấy dữ liệu về tiêu đề, ảnh, kênh và phụ đề chi tiết.
    public TranscriptResponseDto fetchYouTubeCaptions(String youtubeUrl) {
        try {
            // Validate URL
            String videoId = YouTubeCaptionUtil.extractVideoId(youtubeUrl);
            if (videoId == null || videoId.isEmpty()) {
                TranscriptResponseDto errorResponse = new TranscriptResponseDto();
                errorResponse.videoId = null;
                errorResponse.error = "Invalid YouTube URL";
                return errorResponse;
            }

            // Fetch English transcript với chunks
            com.example.DATN.util.TranscriptFetchResult fetchResult = YouTubeCaptionUtil
                    .fetchEnglishTranscript(videoId);

            if (fetchResult == null || fetchResult.transcript == null || fetchResult.transcript.isEmpty()) {
                TranscriptResponseDto errorResponse = new TranscriptResponseDto();
                errorResponse.videoId = videoId;
                errorResponse.error = "Failed to fetch captions. Please check if the video has subtitles available.";
                return errorResponse;
            }

            // Fetch video metadata
            java.util.Map<String, String> metadata = YouTubeCaptionUtil.fetchVideoMetadata(youtubeUrl);
            String title = metadata.get("title");
            String thumbnailUrl = metadata.get("thumbnailUrl");
            String channelName = metadata.get("channelName");
            String duration = metadata.get("duration");
            String channelAvatarUrl = metadata.get("channelAvatarUrl");

            // Build timed segments từ chunks
            List<TranscriptSegmentDto> segments = new ArrayList<>();
            if (fetchResult.chunks != null && !fetchResult.chunks.isEmpty()) {
                segments = YouTubeTranscriptService.buildTimedSegments(
                        fetchResult.chunks,
                        fetchResult.transcript,
                        fetchResult.language);
            }

            // Determine language
            String language = fetchResult.language != null ? fetchResult.language : "en";
            if (language.contains("fallback")) {
                language = language.replace(" (fallback)", "");
            }

            // Build response
            TranscriptResponseDto response = new TranscriptResponseDto(
                    videoId,
                    title,
                    fetchResult.transcript,
                    segments,
                    language,
                    youtubeUrl,
                    thumbnailUrl,
                    channelAvatarUrl,
                    channelName,
                    duration);

            return response;

        } catch (Exception e) {
            System.err.println("Error fetching YouTube captions: " + e.getMessage());
            e.printStackTrace();

            TranscriptResponseDto errorResponse = new TranscriptResponseDto();
            errorResponse.error = "Error: " + e.getMessage();
            return errorResponse;
        }
    }

    public java.util.Map<String, String> fetchChannelInfo(String channelUrl) {
        return YouTubeCaptionUtil.fetchChannelMetadata(channelUrl);
    }

    public List<VideoManagementProjection> getDeletedVideos() {
        return videoRepository.findDeletedRows();
    }

    @Transactional
    public void restoreVideo(Long id) {
        videoRepository.restore(id);
    }

    public List<YouTubeChannelManagementProjection> getDeletedChannels() {
        return youTubeChannelRepository.findDeletedRows();
    }

    @Transactional
    public void restoreChannel(Long id) {
        youTubeChannelRepository.restore(id);
    }
}
