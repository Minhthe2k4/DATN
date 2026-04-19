package com.example.DATN.service;

import com.example.DATN.dto.UserVideoChannelDto;
import com.example.DATN.dto.UserVideoDto;
import com.example.DATN.dto.VideoChannelWithVideosDto;
import com.example.DATN.entity.Video;
import com.example.DATN.entity.YouTubeChannel;
import com.example.DATN.repository.VideoRepository;
import com.example.DATN.repository.YouTubeChannelRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * Service xử lý Use Case: Học tiếng Anh qua Video (UC_HocQuaVideo)
 * Cung cấp danh sách video phụ đề và tích hợp tra từ trực tiếp trên Transcript.
 */
@Service
public class UserVideoService {
    private final VideoRepository videoRepository;
    private final YouTubeChannelRepository youTubeChannelRepository;

    public UserVideoService(
            VideoRepository videoRepository,
            YouTubeChannelRepository youTubeChannelRepository
    ) {
        this.videoRepository = videoRepository;
        this.youTubeChannelRepository = youTubeChannelRepository;
    }

    /**
     * Lấy tất cả kênh video có sắn
     */
    public List<UserVideoChannelDto> getAllChannels() {
        List<YouTubeChannel> channels = youTubeChannelRepository.findAll();
        return channels.stream()
                .map(this::toChannelDto)
                .toList();
    }

    /**
     * Lấy chi tiết kênh và danh sách video
     */
    public VideoChannelWithVideosDto getChannelWithVideos(Long channelId) {
        YouTubeChannel channel = youTubeChannelRepository.findById(channelId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Kênh không tìm thấy"));

        List<Video> videos = videoRepository.findByChannel(channel);
        List<UserVideoDto> videoDtos = videos.stream()
                .map(this::toVideoDto)
                .toList();

        return new VideoChannelWithVideosDto(
                channel.id,
                channel.name,
                channel.url,
                extractHandle(channel.url),
                channel.description,
                channel.subscriberCount,
                videoDtos
        );
    }

    /**
     * Lấy thông tin video theo ID
     */
    /**
     * Sub-UC: Xem chi tiết video và phụ đề (UC_XemVideoChiTiet)
     * Lấy thông tin video kèm Transcript (phụ đề) để hiển thị đồng bộ với trình phát.
     */
    public UserVideoDto getVideoById(Long videoId) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Video không tìm thấy"));
        return toVideoDto(video);
    }

    /**
     * Lấy tất cả video (có phân trang có thể được thêm sau)
     */
    public List<UserVideoDto> getAllVideos() {
        List<Video> videos = videoRepository.findAll();
        return videos.stream()
                .map(this::toVideoDto)
                .toList();
    }

    /**
     * Lấy video theo kênh (support pagination có thể được thêm sau)
     */
    public List<UserVideoDto> getVideosByChannel(Long channelId) {
        YouTubeChannel channel = youTubeChannelRepository.findById(channelId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Kênh không tìm thấy"));

        List<Video> videos = videoRepository.findByChannel(channel);
        return videos.stream()
                .map(this::toVideoDto)
                .toList();
    }

    /**
     * Lấy video theo topic/chủ đề
     */


    // ================ Helper Methods ================

    private UserVideoDto toVideoDto(Video video) {
        return new UserVideoDto(
                video.id,
                defaultString(video.title, "Không xác định"),
                defaultString(video.url, ""),
                video.channel == null ? null : video.channel.id,
                video.channel == null ? "Không xác định" : defaultString(video.channel.name, "Không xác định"),
                defaultString(video.duration, "—"),
                defaultString(video.difficulty, "Trung bình"),
                defaultString(video.transcript, ""),
                video.wordsHighlighted != null ? video.wordsHighlighted : 0,
                defaultString(video.status, "Hoạt động")
        );
    }

    private UserVideoChannelDto toChannelDto(YouTubeChannel channel) {
        long videoCount = videoRepository.findByChannel(channel).size();

        return new UserVideoChannelDto(
                channel.id,
                defaultString(channel.name, "Không xác định"),
                defaultString(channel.url, ""),
                extractHandle(channel.url),
                defaultString(channel.description, ""),
                channel.subscriberCount,
                videoCount
        );
    }

    private String extractHandle(String url) {
        String normalizedUrl = defaultString(url, "").trim();
        int idx = normalizedUrl.lastIndexOf('/');
        if (idx >= 0 && idx + 1 < normalizedUrl.length()) {
            String suffix = normalizedUrl.substring(idx + 1);
            if (!suffix.isBlank()) {
                return suffix.startsWith("@") ? suffix : "@" + suffix;
            }
        }
        return "";
    }

    private String defaultString(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value;
    }
}
