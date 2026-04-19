package com.example.DATN.service;

import com.example.DATN.dto.AdminVideoChannelDto;
import com.example.DATN.dto.AdminVideoDto;
import com.example.DATN.dto.TranscriptResponseDto;
import com.example.DATN.dto.TranscriptSegmentDto;
import com.example.DATN.dto.UpsertVideoChannelRequest;
import com.example.DATN.dto.UpsertVideoRequest;
import com.example.DATN.entity.Segment;
import com.example.DATN.entity.Topic;
import com.example.DATN.entity.Video;
import com.example.DATN.entity.YouTubeChannel;
import com.example.DATN.repository.SegmentRepository;
import com.example.DATN.repository.TopicRepository;
import com.example.DATN.repository.VideoRepository;
import com.example.DATN.repository.YouTubeChannelRepository;
import com.example.DATN.repository.YouTubeChannelManagementProjection;
import com.example.DATN.repository.VideoManagementProjection;
import com.example.DATN.util.YouTubeCaptionUtil;
import com.example.DATN.util.YouTubeTranscriptService;
import java.util.ArrayList;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdminVideoService {
    private final VideoRepository videoRepository;
    private final YouTubeChannelRepository youTubeChannelRepository;
    private final TopicRepository topicRepository;
    private final SegmentRepository segmentRepository;

    public AdminVideoService(
            VideoRepository videoRepository,
            YouTubeChannelRepository youTubeChannelRepository,
            TopicRepository topicRepository,
            SegmentRepository segmentRepository
    ) {
        this.videoRepository = videoRepository;
        this.youTubeChannelRepository = youTubeChannelRepository;
        this.topicRepository = topicRepository;
        this.segmentRepository = segmentRepository;
    }

    public List<AdminVideoChannelDto> findAllChannels() {
        return youTubeChannelRepository.findChannelManagementRows().stream().map(this::toChannelDto).toList();
    }

    public AdminVideoChannelDto findChannelById(Long id) {
        YouTubeChannel channel = youTubeChannelRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Channel not found"));

        long videoCount = videoRepository.findVideoManagementRows().stream()
                .filter(v -> id.equals(v.getChannelId()))
                .count();

        return new AdminVideoChannelDto(
            toLong(Math.toIntExact(channel.id)),
                defaultString(channel.name, ""),
            extractHandle(channel.url),
            "General",
                videoCount,
            "Hoạt động"
        );
    }

    public AdminVideoChannelDto createChannel(UpsertVideoChannelRequest request) {
        YouTubeChannel channel = new YouTubeChannel();
        applyChannel(channel, request);
        YouTubeChannel saved = youTubeChannelRepository.save(channel);
        return findChannelById(toLong(Math.toIntExact(saved.id)));
    }

    public AdminVideoChannelDto updateChannel(Long id, UpsertVideoChannelRequest request) {
        YouTubeChannel channel = youTubeChannelRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Channel not found"));
        applyChannel(channel, request);
        youTubeChannelRepository.save(channel);
        return findChannelById(id);
    }

    public void deleteChannel(Long id) {
        boolean hasVideos = videoRepository.findVideoManagementRows().stream().anyMatch(v -> id.equals(v.getChannelId()));
        if (hasVideos) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot delete channel with linked videos");
        }
        if (!youTubeChannelRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Channel not found");
        }
        youTubeChannelRepository.deleteById(id);
    }

    public List<AdminVideoDto> findAllVideos() {
        return videoRepository.findVideoManagementRows().stream().map(this::toVideoDto).toList();
    }

    public AdminVideoDto findVideoById(Long id) {
        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Video not found"));

        return new AdminVideoDto(
            toLong(Math.toIntExact(video.id)),
                defaultString(video.title, ""),
                defaultString(video.url, ""),
            video.channel == null ? null : toLong(Math.toIntExact(video.channel.id)),
                video.channel == null ? "" : defaultString(video.channel.name, ""),

            "Trung bình",
            "—",
            0,
            "Chờ biên tập"
        );
    }

    public AdminVideoDto createVideo(UpsertVideoRequest request) {
        Video video = new Video();
        applyVideo(video, request);
        Video saved = videoRepository.save(video);
        return findVideoById(toLong(Math.toIntExact(saved.id)));
    }

    public AdminVideoDto updateVideo(Long id, UpsertVideoRequest request) {
        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Video not found"));
        applyVideo(video, request);
        videoRepository.save(video);
        return findVideoById(id);
    }

    public void deleteVideo(Long id) {
        if (!videoRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Video not found");
        }
        videoRepository.deleteById(id);
    }

    private void applyChannel(YouTubeChannel channel, UpsertVideoChannelRequest request) {
        String name = request == null ? "" : defaultString(request.name(), "").trim();
        if (name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Channel name is required");
        }
        String handle = normalizeHandle(request == null ? null : request.handle());
        if (handle.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Channel handle is required");
        }

        channel.name = name;
        channel.url = "https://www.youtube.com/" + handle;
        channel.description = defaultString(request == null ? null : request.topic(), "General").trim();
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

        Topic topic = null;
        if (request.topicId() != null) {
            topic = topicRepository.findById(request.topicId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Topic not found"));
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
                    video
                );
                video.segments.add(segment);
            }
        }
    }

    private AdminVideoChannelDto toChannelDto(YouTubeChannelManagementProjection row) {
        return new AdminVideoChannelDto(
                row.getId(),
                defaultString(row.getName(), ""),
            extractHandle(row.getUrl()),
            "General",
                row.getVideoCount() == null ? 0 : row.getVideoCount(),
            "Hoạt động"
        );
    }

    private AdminVideoDto toVideoDto(VideoManagementProjection row) {
        return new AdminVideoDto(
                row.getId(),
                defaultString(row.getTitle(), ""),
                defaultString(row.getUrl(), ""),
                row.getChannelId(),
                defaultString(row.getChannelName(), ""),

                "Trung bình",
                "—",
                0,
                "Chờ biên tập"
        );
    }

    private String normalizeHandle(String value) {
        String handle = defaultString(value, "").trim();
        if (handle.isBlank()) {
            return "";
        }
        return handle.startsWith("@") ? handle : "@" + handle;
    }

    private String extractHandle(String url) {
        String normalizedUrl = defaultString(url, "").trim();
        int idx = normalizedUrl.lastIndexOf('/');
        if (idx >= 0 && idx + 1 < normalizedUrl.length()) {
            String suffix = normalizedUrl.substring(idx + 1);
            return normalizeHandle(suffix);
        }
        return "";
    }

    private String defaultString(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value;
    }

    private Long toLong(Integer value) {
        return value == null ? null : value.longValue();
    }

    /**
     * Fetch captions từ YouTube video
     * Trả về TranscriptResponseDto với:
     * - videoId
     * - title
     * - transcript (full text)
     * - language
     * - sourceUrl
     */
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
            com.example.DATN.util.TranscriptFetchResult fetchResult = 
                YouTubeCaptionUtil.fetchEnglishTranscript(videoId);
            
            if (fetchResult == null || fetchResult.transcript == null || fetchResult.transcript.isEmpty()) {
                TranscriptResponseDto errorResponse = new TranscriptResponseDto();
                errorResponse.videoId = videoId;
                errorResponse.error = "Failed to fetch captions. Please check if the video has subtitles available.";
                return errorResponse;
            }

            // Fetch video title
            String title = YouTubeCaptionUtil.fetchVideoTitle(youtubeUrl);

            // Build timed segments từ chunks
            List<TranscriptSegmentDto> segments = new ArrayList<>();
            if (fetchResult.chunks != null && !fetchResult.chunks.isEmpty()) {
                segments = YouTubeTranscriptService.buildTimedSegments(
                    fetchResult.chunks,
                    fetchResult.transcript,
                    fetchResult.language
                );
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
                youtubeUrl
            );

            return response;

        } catch (Exception e) {
            System.err.println("Error fetching YouTube captions: " + e.getMessage());
            e.printStackTrace();
            
            TranscriptResponseDto errorResponse = new TranscriptResponseDto();
            errorResponse.error = "Error: " + e.getMessage();
            return errorResponse;
        }
    }
}
