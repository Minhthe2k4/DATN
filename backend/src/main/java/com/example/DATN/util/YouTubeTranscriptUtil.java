package com.example.DATN.util;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Utility để lấy transcript từ YouTube video URL
 */
public class YouTubeTranscriptUtil {

    /**
     * Extract YouTube video ID từ URL
     * Support:
     * - https://www.youtube.com/watch?v=dQw4w9WgXcQ
     * - https://youtu.be/dQw4w9WgXcQ
     * - dQw4w9WgXcQ (direct ID)
     */
    public static String extractYoutubeId(String url) {
        if (url == null || url.trim().isEmpty()) {
            return null;
        }

        // Direct YouTube ID (11 characters)
        if (url.matches("^[a-zA-Z0-9_-]{11}$")) {
            return url;
        }

        // Format: https://www.youtube.com/watch?v=ID
        Pattern pattern = Pattern.compile("youtube\\.com/watch\\?v=([^&\\n?#]+)");
        Matcher matcher = pattern.matcher(url);
        if (matcher.find()) {
            return matcher.group(1);
        }

        // Format: https://youtu.be/ID
        pattern = Pattern.compile("youtu\\.be/([^&\\n?#]+)");
        matcher = pattern.matcher(url);
        if (matcher.find()) {
            return matcher.group(1);
        }

        return null;
    }

    /**
     * Fetch transcript từ YouTube video
     * Return concatenated text, hoặc null nếu error
     */
    public static String fetchTranscriptFromYouTube(String videoUrl) {
        try {
            String videoId = extractYoutubeId(videoUrl);
            if (videoId == null || videoId.isEmpty()) {
                return null;
            }

            // Tạo URL để fetch transcript (simple approach)
            // Vì youtube-transcript-api là Java library, ta dùng reflection hoặc HTTP call
            // Đơn giản hơn: chỉ return null và fallback
            // Thực tế: để sử dụng youtube-transcript-api cần setup phức tạp

            return null;
        } catch (Exception e) {
            // Fallback on any error
            return null;
        }
    }

    /**
     * Placeholder: dùng external API hoặc fallback
     * Ở đây ta chỉ return null, frontend sẽ dùng hardcoded SUBTITLES
     */
    public static String getTranscript(String youtubeUrl) {
        if (youtubeUrl == null || youtubeUrl.isEmpty()) {
            return "";
        }

        try {
            // Attempt to fetch, nhưng fallback to empty
            return fetchTranscriptFromYouTube(youtubeUrl);
        } catch (Exception e) {
            return "";
        }
    }
}
