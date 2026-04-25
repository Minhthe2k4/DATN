package com.example.DATN.service;

import com.cloudinary.Cloudinary;
import com.example.DATN.entity.Video;
import com.example.DATN.entity.YouTubeChannel;
import com.example.DATN.repository.VideoRepository;
import com.example.DATN.repository.YouTubeChannelRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.UUID;

/**
 * Service xử lý 2 luồng upload video:
 *
 * Luồng 1 — Từ YouTube URL (đơn giản hơn, phù hợp cho đồ án):
 * Admin nhập YouTube URL
 * → yt-dlp download về file tạm
 * → Upload lên Cloudinary
 * → Xóa file tạm
 * → Whisper tạo phụ đề từ Cloudinary URL
 *
 * Luồng 2 — Upload file trực tiếp:
 * Admin chọn file video
 * → Upload lên Cloudinary
 * → Whisper tạo phụ đề
 */
@Service
public class VideoUploadService {

    private final VideoRepository videoRepository;
    private final YouTubeChannelRepository channelRepository;
    private final WhisperTranscriptionService whisperService;
    private final Cloudinary cloudinary;

    @org.springframework.beans.factory.annotation.Value("${datn.tool.yt-dlp:yt-dlp}")
    private String ytDlpPath;

    @org.springframework.beans.factory.annotation.Value("${datn.tool.ffmpeg:ffmpeg}")
    private String ffmpegPath;

    public VideoUploadService(
            VideoRepository videoRepository,
            YouTubeChannelRepository channelRepository,
            WhisperTranscriptionService whisperService,
            Cloudinary cloudinary) {
        this.videoRepository = videoRepository;
        this.channelRepository = channelRepository;
        this.whisperService = whisperService;
        this.cloudinary = cloudinary;
    }

    // ══════════════════════════════════════════════════════════════════
    // LUỒNG 1: Nhập YouTube URL → yt-dlp download → Cloudinary → Whisper
    // ══════════════════════════════════════════════════════════════════

    /**
     * Xử lý khi admin nhập YouTube URL.
     * yt-dlp sẽ download video về file tạm, sau đó upload lên Cloudinary.
     */
    public Long uploadFromYoutubeUrl(String title, Long channelId, String youtubeUrl, String difficulty, String status)
            throws IOException, InterruptedException {
        if (title == null || title.isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tiêu đề không được để trống");
        if (youtubeUrl == null || !youtubeUrl.contains("youtu"))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "URL YouTube không hợp lệ");

        YouTubeChannel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Kênh không tồn tại"));

        // Tạo file tạm để lưu video download từ YouTube
        Path tempFile = Files.createTempFile("yt-download-" + UUID.randomUUID(), ".mp4");

        try {
            // ── Bước 1: yt-dlp download video ────────────────────────────────
            downloadWithYtDlp(youtubeUrl, tempFile);

            // Kiểm tra file có tồn tại và có dữ liệu không
            if (!Files.exists(tempFile) || Files.size(tempFile) == 0) {
                throw new IOException(
                        "yt-dlp không tải được dữ liệu (file rỗng hoặc không tồn tại). Hãy kiểm tra URL YouTube.");
            }

            System.out.println("Tải video thành công. Kích thước: " + Files.size(tempFile) / 1024 + " KB");

            // ── Bước 2: Tự động lấy thời lượng (Duration) dùng ffprobe ─────────
            String duration = getDurationWithFfprobe(tempFile);

            // ── Bước 3: Upload lên Cloudinary ────────────────────────────────
            String cloudinaryUrl = uploadToCloudinary(Files.readAllBytes(tempFile));

            // ── Bước 4: Lưu vào DB và trigger Whisper ────────────────────────
            return saveVideoAndTriggerWhisper(title, channel, cloudinaryUrl, difficulty, duration, status, youtubeUrl);

        } finally {
            // Xóa file tạm dù thành công hay thất bại
            Files.deleteIfExists(tempFile);
        }
    }

    /**
     * Dùng yt-dlp download video từ YouTube về file tạm.
     *
     * Cài yt-dlp: https://github.com/yt-dlp/yt-dlp#installation
     * Windows: winget install yt-dlp hoặc pip install yt-dlp
     *
     * Tùy chọn:
     * -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4" : chọn chất lượng mp4
     * --max-filesize 500m : giới hạn 500MB để tránh download video quá dài
     * -o <output> : đường dẫn file output
     */
    private void downloadWithYtDlp(String youtubeUrl, Path outputFile) throws IOException, InterruptedException {
        // Xóa file rỗng vừa tạo để yt-dlp tự tạo file mới tại đúng vị trí đó
        Files.deleteIfExists(outputFile);

        ProcessBuilder pb = new ProcessBuilder(
                ytDlpPath, // Sử dụng đường dẫn tuyệt đối từ config
                "-f", "bestvideo[ext=mp4][height<=480]+bestaudio[ext=m4a]/best[ext=mp4]/mp4", // Giảm độ phân giải xuống
                                                                                              // 480p để tải nhanh hơn
                                                                                              // và chắc chắn là MP4
                "--max-filesize", "100m", // Giảm giới hạn xuống 100MB cho an toàn
                "--merge-output-format", "mp4",
                "--ffmpeg-location", ffmpegPath, // THÊM DÒNG NÀY: Chỉ cho yt-dlp biết ffmpeg ở đâu
                "-o", outputFile.toAbsolutePath().toString(),
                "--no-playlist",
                "--force-overwrites", // Ép ghi đè
                youtubeUrl);
        pb.redirectErrorStream(true);
        Process process = pb.start();

        // Đọc log từ yt-dlp để biết tại sao lỗi
        try (java.io.BufferedReader reader = new java.io.BufferedReader(
                new java.io.InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println("[yt-dlp] " + line);
            }
        }

        int exitCode = process.waitFor();
        if (exitCode != 0) {
            throw new IOException("yt-dlp thất bại (exit " + exitCode + "). Xem log ở trên để biết chi tiết.");
        }
    }

    // ══════════════════════════════════════════════════════════════════
    // LUỒNG 2: Upload file trực tiếp → Cloudinary → Whisper
    // ══════════════════════════════════════════════════════════════════

    /**
     * Upload trực tiếp file video lên Cloudinary.
     */
    public Long uploadFromFile(String title, Long channelId, MultipartFile file, String difficulty, String status)
            throws IOException {
        YouTubeChannel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Kênh không tồn tại"));

        // Lưu file tạm để lấy duration
        Path tempFile = Files.createTempFile("upload-", file.getOriginalFilename());
        Files.write(tempFile, file.getBytes());

        try {
            String duration = getDurationWithFfprobe(tempFile);
            String cloudinaryUrl = uploadToCloudinary(file.getBytes());
            return saveVideoAndTriggerWhisper(title, channel, cloudinaryUrl, difficulty, duration, status,
                    "File upload");
        } finally {
            Files.deleteIfExists(tempFile);
        }
    }

    private String getDurationWithFfprobe(Path videoPath) {
        try {
            // Lệnh lấy tổng số giây: ffprobe -v error -show_entries format=duration -of
            // default=noprint_wrappers=1:nokey=1 file
            String ffprobePath = ffmpegPath.replace("ffmpeg.exe", "ffprobe.exe");
            ProcessBuilder pb = new ProcessBuilder(
                    ffprobePath,
                    "-v", "error",
                    "-show_entries", "format=duration",
                    "-of", "default=noprint_wrappers=1:nokey=1",
                    videoPath.toAbsolutePath().toString());
            Process process = pb.start();
            try (java.io.BufferedReader reader = new java.io.BufferedReader(
                    new java.io.InputStreamReader(process.getInputStream()))) {
                String secondsStr = reader.readLine();
                if (secondsStr != null) {
                    double seconds = Double.parseDouble(secondsStr);
                    int h = (int) (seconds / 3600);
                    int m = (int) ((seconds % 3600) / 60);
                    int s = (int) (seconds % 60);
                    if (h > 0)
                        return String.format("%d:%02d:%02d", h, m, s);
                    return String.format("%d:%02d", m, s);
                }
            }
        } catch (Exception e) {
            System.err.println("Lỗi khi lấy thời lượng video: " + e.getMessage());
        }
        return "0:00";
    }

    private String uploadToCloudinary(byte[] bytes) throws IOException {
        @SuppressWarnings("unchecked")
        Map<String, Object> result = cloudinary.uploader().upload(bytes, Map.of(
                "resource_type", "video",
                "folder", "datn-videos"));
        String url = (String) result.get("secure_url");
        if (url == null)
            throw new IOException("Cloudinary không trả về URL");
        return url;
    }

    /** Tạo Video record trong DB và trigger Whisper async */
    private Long saveVideoAndTriggerWhisper(String title, YouTubeChannel channel, String cloudinaryUrl,
            String difficulty, String duration, String status, String originalUrl) {
        Video video = new Video();
        video.title = title.trim();
        video.filePath = cloudinaryUrl; // lưu Cloudinary URL
        video.channel = channel;
        video.subtitleStatus = "PROCESSING";
        video.status = status; // Sử dụng status từ Admin (Hiển thị/Ẩn)

        // Gán giá trị
        video.wordsHighlighted = 0;
        video.difficulty = difficulty;
        video.duration = duration;
        video.url = originalUrl; // Lưu link YouTube gốc hoặc "File upload"

        Video saved = videoRepository.save(video);

        // Chạy Whisper trong background (không block response)
        whisperService.transcribeVideo(saved.id, cloudinaryUrl);

        return saved.id;
    }

    /** Lấy trạng thái tạo phụ đề — frontend polling mỗi 3 giây */
    public String getSubtitleStatus(Long videoId) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Video không tồn tại"));
        return video.subtitleStatus != null ? video.subtitleStatus : "PENDING";
    }
}
