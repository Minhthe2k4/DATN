package com.example.DATN.service;

import com.example.DATN.entity.Segment;
import com.example.DATN.entity.Video;
import com.example.DATN.repository.SegmentRepository;
import com.example.DATN.repository.VideoRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

/**
 * Service xử lý tự động tạo phụ đề:
 * 1. Dùng FFmpeg để extract audio từ Cloudinary URL
 * 2. Gọi OpenAI Whisper API để nhận transcript có timestamps
 * 3. Lưu segments vào DB và cập nhật trạng thái
 *
 * Lưu ý: FFmpeg có thể đọc trực tiếp từ URL HTTP/HTTPS,
 *        không cần download video về máy trước.
 */
@Service
public class WhisperTranscriptionService {

    private final VideoRepository videoRepository;
    private final SegmentRepository segmentRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${datn.ai.openai-api-key:}")
    private String openAiApiKey;

    @Value("${datn.tool.ffmpeg:ffmpeg}")
    private String ffmpegPath;

    public WhisperTranscriptionService(VideoRepository videoRepository, SegmentRepository segmentRepository) {
        this.videoRepository = videoRepository;
        this.segmentRepository = segmentRepository;
    }

    /**
     * Chạy bất đồng bộ trong background thread.
     * Được gọi ngay sau khi video upload lên Cloudinary thành công.
     *
     * @param videoId      ID video trong DB
     * @param videoUrl     URL Cloudinary (hoặc local path nếu dùng local storage)
     */
    @Async
    public void transcribeVideo(Long videoId, String videoUrl) {
        Video video = videoRepository.findById(videoId).orElse(null);
        if (video == null) return;

        System.out.println("[Whisper] Bắt đầu xử lý video ID: " + videoId);
        Path audioPath = null;
        try {
            System.out.println("[Whisper] Đang trích xuất âm thanh...");
            audioPath = extractAudioWithFfmpeg(videoUrl);

            System.out.println("[Whisper] Đang gọi API OpenAI...");
            List<WhisperSegment> whisperSegments = callWhisperApi(audioPath.toFile());
            System.out.println("[Whisper] Nhận được " + whisperSegments.size() + " segments.");

            segmentRepository.deleteByVideoId(videoId);

            List<Segment> segments = new ArrayList<>();
            StringBuilder fullTranscript = new StringBuilder();
            for (int i = 0; i < whisperSegments.size(); i++) {
                WhisperSegment ws = whisperSegments.get(i);
                segments.add(new Segment((long) (i + 1), ws.start, ws.end, ws.text.trim(), video));
                fullTranscript.append(ws.text.trim()).append(" ");
            }
            segmentRepository.saveAll(segments);

            video.subtitleStatus = "DONE";
            video.transcript = fullTranscript.toString().trim();
            videoRepository.save(video);
            System.out.println("[Whisper] Hoàn thành cho video ID: " + videoId);

        } catch (Exception e) {
            System.err.println("[Whisper] Lỗi: " + e.getMessage());
            video.subtitleStatus = "ERROR";
            videoRepository.save(video);
        } finally {
            if (audioPath != null) {
                try { Files.deleteIfExists(audioPath); } catch (IOException ignored) {}
            }
        }
    }

    /**
     * FFmpeg extract audio từ nguồn (URL hoặc local path).
     *
     * FFmpeg hỗ trợ đọc từ HTTP/HTTPS URL trực tiếp, vì vậy Cloudinary URL
     * hoạt động ngay mà không cần download về máy.
     *
     * Output: file .mp3 tạm với bitrate thấp (< 25MB để Whisper chấp nhận)
     */
    private Path extractAudioWithFfmpeg(String source) throws IOException, InterruptedException {
        Path audioPath = Files.createTempFile("whisper-audio-", ".mp3");

        ProcessBuilder pb = new ProcessBuilder(
                ffmpegPath,     // Sử dụng đường dẫn từ config
                "-i", source,   // nguồn: Cloudinary URL hoặc local file path
                "-vn",          // bỏ video stream, chỉ lấy audio
                "-ar", "16000", // sample rate 16kHz (đủ cho speech recognition)
                "-ac", "1",     // mono (nhỏ hơn stereo)
                "-b:a", "32k",  // bitrate thấp để file < 25MB
                "-y",           // ghi đè file tạm nếu tồn tại
                audioPath.toString()
        );
        pb.redirectErrorStream(true);
        Process process = pb.start();
        int exitCode = process.waitFor();

        if (exitCode != 0) {
            throw new IOException("FFmpeg thất bại (exit " + exitCode + "). " +
                    "Hãy cài FFmpeg: https://ffmpeg.org/download.html");
        }
        return audioPath;
    }

    /**
     * Gọi OpenAI Whisper API để nhận transcript.
     * response_format=verbose_json trả về từng câu với timestamps.
     */
    private List<WhisperSegment> callWhisperApi(java.io.File audioFile) throws IOException, InterruptedException {
        if (openAiApiKey == null || openAiApiKey.isBlank() || openAiApiKey.startsWith("YOUR_")) {
            throw new IOException("OpenAI API key chưa được cấu hình");
        }

        byte[] audioBytes = Files.readAllBytes(audioFile.toPath());
        String boundary = "----WhisperBoundary" + System.currentTimeMillis();
        byte[] body = buildMultipartBody(boundary, audioFile.getName(), audioBytes);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.openai.com/v1/audio/transcriptions"))
                .header("Authorization", "Bearer " + openAiApiKey)
                .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                .POST(HttpRequest.BodyPublishers.ofByteArray(body))
                .build();

        HttpResponse<String> response = HttpClient.newHttpClient()
                .send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new IOException("Whisper API lỗi " + response.statusCode() + ": " + response.body());
        }

        return parseWhisperResponse(response.body());
    }

    /** Tạo multipart/form-data body để gửi file lên Whisper API */
    private byte[] buildMultipartBody(String boundary, String filename, byte[] fileBytes) throws IOException {
        String CRLF = "\r\n";
        String sep = "--" + boundary;

        String parts = sep + CRLF
                + "Content-Disposition: form-data; name=\"model\"" + CRLF + CRLF
                + "whisper-1" + CRLF
                + sep + CRLF
                + "Content-Disposition: form-data; name=\"response_format\"" + CRLF + CRLF
                + "verbose_json" + CRLF
                + sep + CRLF
                + "Content-Disposition: form-data; name=\"file\"; filename=\"" + filename + "\"" + CRLF
                + "Content-Type: audio/mpeg" + CRLF + CRLF;

        String end = CRLF + sep + "--" + CRLF;

        byte[] header = parts.getBytes();
        byte[] endBytes = end.getBytes();
        byte[] result = new byte[header.length + fileBytes.length + endBytes.length];
        System.arraycopy(header, 0, result, 0, header.length);
        System.arraycopy(fileBytes, 0, result, header.length, fileBytes.length);
        System.arraycopy(endBytes, 0, result, header.length + fileBytes.length, endBytes.length);
        return result;
    }

    /** Parse JSON response từ Whisper: {"segments": [{"start", "end", "text"}, ...]} */
    private List<WhisperSegment> parseWhisperResponse(String json) throws IOException {
        JsonNode root = objectMapper.readTree(json);
        JsonNode segsNode = root.get("segments");
        List<WhisperSegment> result = new ArrayList<>();
        if (segsNode != null && segsNode.isArray()) {
            for (JsonNode seg : segsNode) {
                WhisperSegment ws = new WhisperSegment();
                ws.start = seg.get("start").asDouble();
                ws.end   = seg.get("end").asDouble();
                ws.text  = seg.get("text").asText();
                result.add(ws);
            }
        }
        return result;
    }

    private static class WhisperSegment {
        double start, end;
        String text;
    }
}
