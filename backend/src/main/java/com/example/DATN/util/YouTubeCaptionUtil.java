package com.example.DATN.util;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.example.DATN.dto.TranscriptChunkDto;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

public class YouTubeCaptionUtil {

    private static final String TIMEDTEXT_BASE = "https://www.youtube.com/api/timedtext";
    private static final int TIMEOUT_MS = 10000;
    private static final String USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

    /**
     * Extract YouTube video ID từ URL (support nhiều format)
     */
    public static String extractVideoId(String youtubeUrl) {
        if (youtubeUrl == null || youtubeUrl.isEmpty()) {
            return null;
        }

        // Direct YouTube ID (11 characters)
        if (youtubeUrl.matches("^[a-zA-Z0-9_-]{11}$")) {
            return youtubeUrl;
        }

        // Format: youtube.com/watch?v=ID
        Pattern pattern = Pattern.compile("youtube\\.com/watch\\?v=([a-zA-Z0-9_-]+)");
        Matcher matcher = pattern.matcher(youtubeUrl);
        if (matcher.find()) {
            return matcher.group(1);
        }

        // Format: youtu.be/ID
        pattern = Pattern.compile("youtu\\.be/([a-zA-Z0-9_-]+)");
        matcher = pattern.matcher(youtubeUrl);
        if (matcher.find()) {
            return matcher.group(1);
        }

        // Format: youtube.com/embed/ID
        pattern = Pattern.compile("youtube\\.com/embed/([a-zA-Z0-9_-]+)");
        matcher = pattern.matcher(youtubeUrl);
        if (matcher.find()) {
            return matcher.group(1);
        }

        return null;
    }

    /**
     * Fetch transcript chính - lấy tiếng Hàn (ko) từ YouTube timedtext
     * Thử:
     * 1. lang=ko&fmt=json3
     * 2. lang=ko nếu json3 fail
     * 3. Default language nếu ko không có
     */
    public static TranscriptFetchResult fetchTranscriptPrimary(String videoId) {
        if (videoId == null || videoId.isEmpty()) {
            return null;
        }

        // Thử lang=en JSON3 (Ưu tiên tiếng Anh)
        TranscriptFetchResult result = fetchWithLanguage(videoId, "en", "json3");
        if (result != null) {
            return result;
        }

        // Thử lang=en HTML
        result = fetchWithLanguage(videoId, "en", null);
        if (result != null) {
            return result;
        }

        // Thử default language
        result = fetchWithLanguage(videoId, null, "json3");
        if (result != null) {
            return result;
        }

        return null;
    }

    /**
     * Fetch transcript fallback - thử các ngôn ngữ khác nếu primary fail
     */
    public static TranscriptFetchResult fetchTranscriptFallback(String videoId, String primaryLanguage) {
        if (videoId == null || videoId.isEmpty()) {
            return null;
        }

        // Danh sách ngôn ngữ thay thế (ưu tiên tiếng phổ biến)
        String[] fallbackLanguages = { "en", "ja", "zh-Hans", "fr", "es", "de", "ru", "pt", "ar" };

        for (String lang : fallbackLanguages) {
            if (lang.equals(primaryLanguage)) {
                continue; // Skip ngôn ngữ đã thử
            }

            TranscriptFetchResult result = fetchWithLanguage(videoId, lang, "json3");
            if (result != null) {
                result.language = lang + " (fallback)";
                return result;
            }

            result = fetchWithLanguage(videoId, lang, null);
            if (result != null) {
                result.language = lang + " (fallback)";
                return result;
            }
        }

        return null;
    }

    /**
     * Gọi YouTube timedtext API với language cụ thể
     */
    private static TranscriptFetchResult fetchWithLanguage(String videoId, String language, String fmt) {
        try {
            StringBuilder urlBuilder = new StringBuilder(TIMEDTEXT_BASE);
            urlBuilder.append("?v=").append(videoId);

            if (language != null && !language.isEmpty()) {
                urlBuilder.append("&lang=").append(language);
            }

            if (fmt != null && !fmt.isEmpty()) {
                urlBuilder.append("&fmt=").append(fmt);
            }

            String urlStr = urlBuilder.toString();
            String debugInfo = "lang=" + (language == null ? "default" : language) +
                    " fmt=" + (fmt == null ? "html" : fmt);
            System.err.println("[DEBUG] Trying to fetch: " + debugInfo);
            System.err.println("[DEBUG] URL: " + urlStr);

            URL url = new URL(urlStr);

            java.net.URLConnection conn = url.openConnection();
            conn.setRequestProperty("User-Agent", USER_AGENT);
            conn.setConnectTimeout(TIMEOUT_MS);
            conn.setReadTimeout(TIMEOUT_MS);

            // Log HTTP response code
            if (conn instanceof java.net.HttpURLConnection) {
                java.net.HttpURLConnection httpConn = (java.net.HttpURLConnection) conn;
                System.err.println("[DEBUG] HTTP Response Code: " + httpConn.getResponseCode());
            }

            String contentType = conn.getContentType();
            System.err.println("[DEBUG] Content-Type: " + contentType);

            String charset = "UTF-8";
            if (contentType != null && contentType.contains("charset=")) {
                charset = contentType.split("charset=")[1].toUpperCase();
            }

            BufferedReader reader = new BufferedReader(
                    new InputStreamReader(conn.getInputStream(), charset));

            StringBuilder content = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                content.append(line).append("\n");
            }
            reader.close();

            String responseBody = content.toString().trim();
            System.err.println("[DEBUG] Response length: " + responseBody.length());

            if (responseBody.isEmpty()) {
                System.err.println("[DEBUG] Empty response for " + debugInfo);
                System.err.println("[DEBUG] Response body sample (first 200 chars): ["
                        + responseBody.substring(0, Math.min(200, responseBody.length())) + "]");
                return null;
            }

            System.err.println("[DEBUG] Got response (" + responseBody.length() + " chars) for " + debugInfo);
            System.err.println(
                    "[DEBUG] Response sample: " + responseBody.substring(0, Math.min(300, responseBody.length())));

            // Parse JSON3 format
            if (fmt != null && fmt.equals("json3")) {
                TranscriptFetchResult jsonResult = parseJson3Format(videoId, responseBody, language);
                if (jsonResult != null)
                    return jsonResult;
                // If json3 fails, fall back to HTML parsing just in case
                System.err.println("[DEBUG] JSON3 parsing failed for " + videoId + ", falling back to HTML parsing...");
            }

            // Parse HTML/XML format
            return parseHtmlFormat(videoId, responseBody, language);

        } catch (Exception e) {
            System.err.println("[ERROR] Failed to fetch " + videoId + " (lang=" + language + "): "
                    + e.getClass().getSimpleName() + " - " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Parse JSON3 format từ YouTube timedtext
     */
    private static TranscriptFetchResult parseJson3Format(String videoId, String json, String language) {
        if (json == null || json.trim().isEmpty()) {
            return null;
        }

        String trimmedJson = json.trim();
        if (!trimmedJson.startsWith("{")) {
            System.err.println("[DEBUG] Response for " + videoId + " is not a valid JSON3 object (starts with: " +
                    trimmedJson.substring(0, Math.min(20, trimmedJson.length())) + ")");
            return null;
        }

        try {
            JSONObject obj = new JSONObject(trimmedJson);

            // JSON3 format: events array với dur (duration) và tStartMs (start time in ms)
            JSONArray events = obj.optJSONArray("events");
            if (events == null || events.length() == 0) {
                System.err.println("[DEBUG] No events found in JSON3 response for " + videoId);
                return null;
            }

            List<TranscriptChunkDto> chunks = new ArrayList<>();
            StringBuilder fullTranscript = new StringBuilder();

            for (int i = 0; i < events.length(); i++) {
                JSONObject event = events.getJSONObject(i);

                // Lấy text
                String text = "";
                if (event.has("segs")) {
                    JSONArray segs = event.getJSONArray("segs");
                    for (int j = 0; j < segs.length(); j++) {
                        text += segs.getJSONObject(j).optString("utf8", "");
                    }
                }

                if (text.isEmpty()) {
                    continue;
                }

                long startMs = event.optLong("tStartMs", 0);
                long durationMs = event.optLong("dur", 0);
                if (durationMs < 100) {
                    durationMs = 500; // Default minimum duration
                }

                // Chuyển đổi ms -> giây
                double startSec = startMs / 1000.0;
                double durationSec = durationMs / 1000.0;

                TranscriptChunkDto chunk = new TranscriptChunkDto(
                        text.trim(),
                        startSec,
                        durationSec,
                        startSec + durationSec);

                chunks.add(chunk);

                if (!fullTranscript.isEmpty()) {
                    fullTranscript.append(" ");
                }
                fullTranscript.append(text.trim());
            }

            if (chunks.isEmpty()) {
                return null;
            }

            return new TranscriptFetchResult(
                    fullTranscript.toString(),
                    chunks,
                    language != null ? language : "unknown",
                    "json3");

        } catch (JSONException e) {
            System.err.println("Error parsing JSON3: " + e.getMessage());
            return null;
        }
    }

    /**
     * Parse HTML/XML format từ YouTube timedtext
     */
    private static TranscriptFetchResult parseHtmlFormat(String videoId, String htmlContent, String language) {
        try {
            // YouTube timedtext API trả HTML/XML dạng:
            // <transcript><text start="0.5" dur="1.5">Hello</text>...</transcript>

            Document doc = Jsoup.parse(htmlContent);
            Elements textElements = doc.select("text");

            if (textElements.isEmpty()) {
                System.err.println("[DEBUG] No text elements found in HTML/XML for " + videoId);
                return null;
            }

            System.err.println("[DEBUG] Found " + textElements.size() + " text elements for " + videoId);

            List<TranscriptChunkDto> chunks = new ArrayList<>();
            StringBuilder fullTranscript = new StringBuilder();

            for (Element elem : textElements) {
                String text = elem.text();
                if (text.isEmpty()) {
                    continue;
                }

                String startAttr = elem.attr("start");
                String durAttr = elem.attr("dur");

                double startSec = 0;
                double durationSec = 0.5; // default

                try {
                    startSec = Double.parseDouble(startAttr);
                } catch (NumberFormatException e) {
                    System.err.println("Invalid start time: " + startAttr);
                }

                try {
                    durationSec = Double.parseDouble(durAttr);
                    if (durationSec < 0.1) {
                        durationSec = 0.5;
                    }
                } catch (NumberFormatException e) {
                    System.err.println("Invalid duration: " + durAttr);
                }

                TranscriptChunkDto chunk = new TranscriptChunkDto(
                        text.trim(),
                        startSec,
                        durationSec,
                        startSec + durationSec);

                chunks.add(chunk);

                if (!fullTranscript.isEmpty()) {
                    fullTranscript.append(" ");
                }
                fullTranscript.append(text.trim());
            }

            if (chunks.isEmpty()) {
                return null;
            }

            return new TranscriptFetchResult(
                    fullTranscript.toString(),
                    chunks,
                    language != null ? language : "unknown",
                    "html");

        } catch (Exception e) {
            System.err.println("Error parsing HTML: " + e.getMessage());
            return null;
        }
    }

    /**
     * Fetch English transcripts specifically (for admin panel video uploads)
     * Lấy từ ytInitialPlayerResponse trong mã HTML của YouTube để tránh lỗi 403
     * API.
     */
    public static TranscriptFetchResult fetchEnglishTranscript(String videoId) {
        if (videoId == null || videoId.isEmpty())
            return null;

        System.err.println("\n[INFO] Starting English transcript fetch for video: " + videoId);

        try {
            // 1. Lấy HTML của video
            URL url = new URL("https://www.youtube.com/watch?v=" + videoId);
            java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
            conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
            conn.setRequestProperty("Accept-Language", "en-US,en;q=0.9");
            conn.setConnectTimeout(TIMEOUT_MS);
            conn.setReadTimeout(TIMEOUT_MS);

            BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream(), "UTF-8"));
            StringBuilder html = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                html.append(line);
            }
            reader.close();

            String htmlStr = html.toString();

            // 2. Tìm ytInitialPlayerResponse
            Pattern p = Pattern.compile("ytInitialPlayerResponse\\s*=\\s*(\\{.+?\\});");
            Matcher m = p.matcher(htmlStr);
            if (!m.find()) {
                System.err.println("[ERROR] ytInitialPlayerResponse not found.");
                return null;
            }

            String jsonRaw = m.group(1);
            JSONObject json = new JSONObject(jsonRaw);

            if (!json.has("captions")) {
                System.err.println("[ERROR] No captions object in ytInitialPlayerResponse.");
                return null;
            }

            JSONObject playerCaptions = json.getJSONObject("captions").optJSONObject("playerCaptionsTracklistRenderer");
            if (playerCaptions == null || !playerCaptions.has("captionTracks")) {
                System.err.println("[ERROR] No captionTracks found.");
                return null;
            }

            JSONArray tracks = playerCaptions.getJSONArray("captionTracks");
            String targetBaseUrl = null;
            String langCodeStr = "en";

            // Ưu tiên tìm phụ đề tiếng Anh (en)
            for (int i = 0; i < tracks.length(); i++) {
                JSONObject track = tracks.getJSONObject(i);
                String langCode = track.getString("languageCode");
                if (langCode.startsWith("en")) {
                    targetBaseUrl = track.getString("baseUrl");
                    langCodeStr = langCode;
                    break;
                }
            }

            // Nếu không có tiếng Anh, thử dùng phụ đề đầu tiên làm fallback
            if (targetBaseUrl == null && tracks.length() > 0) {
                JSONObject track = tracks.getJSONObject(0);
                targetBaseUrl = track.getString("baseUrl");
                langCodeStr = track.getString("languageCode");
                System.err.println("[WARN] No English captions. Fallback to: " + langCodeStr);
            }

            if (targetBaseUrl == null) {
                System.err.println("[ERROR] Could not extract any baseUrl.");
                return null;
            }

            // 3. Gọi baseUrl kèm param &fmt=json3 để lấy dữ liệu JSON3
            String dlUrl = targetBaseUrl + "&fmt=json3";
            java.net.HttpURLConnection dlConn = (java.net.HttpURLConnection) new URL(dlUrl).openConnection();
            dlConn.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");

            BufferedReader r = new BufferedReader(new InputStreamReader(dlConn.getInputStream(), "UTF-8"));
            StringBuilder json3Data = new StringBuilder();
            String l;
            while ((l = r.readLine()) != null)
                json3Data.append(l);
            r.close();

            System.err.println("[SUCCESS] Fetched captions from baseUrl. Parsing...");
            TranscriptFetchResult jsonResult = parseJson3Format(videoId, json3Data.toString(), langCodeStr);
            if (jsonResult != null)
                return jsonResult;

            // Fallback to HTML if JSON3 parsing fails
            return parseHtmlFormat(videoId, json3Data.toString(), langCodeStr);

        } catch (Exception e) {
            System.err.println("[ERROR] Failed to fetch transcript from HTML parser: " + e.getMessage());
            return null;
        }
    }

    /**
     * Main entry point: Fetch captions/transcript
     * Thử tầng 1 (Korean), rơi lại tầng 2 (fallback languages)
     * 
     * Return: TranscriptFetchResult hoặc null nếu thất bại
     */
    public static TranscriptFetchResult fetchCaptions(String youtubeUrl) {
        try {
            String videoId = extractVideoId(youtubeUrl);
            if (videoId == null || videoId.isEmpty()) {
                System.err.println("Invalid YouTube URL: " + youtubeUrl);
                return null;
            }

            // Tầng 1: Lấy tiếng Anh
            TranscriptFetchResult result = fetchTranscriptPrimary(videoId);
            if (result != null && !result.transcript.isEmpty()) {
                return result;
            }

            // Tầng 2: Fallback (thử bất kỳ ngôn ngữ nào có sẵn)
            result = fetchTranscriptFallback(videoId, "en");
            if (result != null && !result.transcript.isEmpty()) {
                return result;
            }

            // Thất bại
            System.err.println("Could not fetch captions for video: " + videoId);
            return null;

        } catch (Exception e) {
            System.err.println("Error fetching captions: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Fetch video title từ YouTube oEmbed API
     */
    public static String fetchVideoTitle(String youtubeUrl) {
        try {
            String oembedUrl = "https://www.youtube.com/oembed?url=" +
                    urlEncode(youtubeUrl) + "&format=json";

            URL url = new URL(oembedUrl);
            java.net.URLConnection conn = url.openConnection();
            conn.setRequestProperty("User-Agent", USER_AGENT);
            conn.setConnectTimeout(TIMEOUT_MS);

            BufferedReader reader = new BufferedReader(
                    new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8));

            StringBuilder content = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                content.append(line);
            }
            reader.close();

            JSONObject obj = new JSONObject(content.toString());
            return obj.optString("title", "Unknown Title");

        } catch (Exception e) {
            System.err.println("Error fetching video title: " + e.getMessage());
            return "Unknown Title";
        }
    }

    /**
     * Simple method để lấy transcript text từ YouTube
     * Không return chunks - chỉ return full transcript text
     * Thử tầng 1 (Korean), fallback tầng 2 (các ngôn ngữ khác)
     */
    public static String getTranscriptText(String youtubeUrl) {
        try {
            String videoId = extractVideoId(youtubeUrl);
            if (videoId == null || videoId.isEmpty()) {
                System.err.println("Invalid YouTube URL: " + youtubeUrl);
                return null;
            }

            System.err.println("\n=== Fetching captions for video: " + videoId + " ===");

            // Chỉ fetch tiếng Anh (English only)
            System.err.println("[FETCH] Trying to fetch English captions...");

            TranscriptFetchResult result = fetchWithLanguage(videoId, "en", "json3");
            if (result != null && !result.transcript.isEmpty()) {
                System.err.println("[SUCCESS] Got English captions (JSON3 format)");
                return result.transcript;
            }

            result = fetchWithLanguage(videoId, "en", null);
            if (result != null && !result.transcript.isEmpty()) {
                System.err.println("[SUCCESS] Got English captions (HTML format)");
                return result.transcript;
            }

            System.err.println("Could not fetch English transcript for video: " + videoId);
            return null;

        } catch (Exception e) {
            System.err.println("Error getting transcript text: " + e.getMessage());
            return null;
        }
    }

    /**
     * URL encode utility
     */
    private static String urlEncode(String str) {
        try {
            return java.net.URLEncoder.encode(str, "UTF-8");
        } catch (Exception e) {
            return str;
        }
    }
}
