package com.example.DATN.util;

import com.example.DATN.dto.TranscriptSegmentDto;
import com.example.DATN.dto.TranscriptChunkDto;
import java.util.*;
import java.util.regex.Pattern;

/**
 * Service để xử lý transcript text, tách câu, và xây dựng segments có timing.
 * Dùng cho luyện nghe (dictation listening practice).
 */
public class YouTubeTranscriptService {

    // Min và max duration cho một segment
    private static final double MIN_SEGMENT_DURATION = 0.2;
    private static final double MAX_SEGMENT_DURATION = 8.0;
    private static final double MIN_CHUNK_DURATION = 0.1;

    /**
     * Normalize text: gộp khoảng trắng, trim, xóa ký tự lạ
     */
    public static String normalizeText(String text) {
        if (text == null || text.isEmpty()) {
            return "";
        }

        // Trim
        text = text.trim();

        // Gộp khoảng trắng liên tiếp thành 1
        text = text.replaceAll("\\s+", " ");

        // Xóa ký tự control (nhưng giữ newline để tách câu)
        text = text.replaceAll("[\\p{Cc}]", " ");

        return text.trim();
    }

    /**
     * Tách text thành segments dựa trên timing của chunks.
     * Logic:
     * 1. Nhóm chunks thành câu (sentence boundaries)
     * 2. Gộp các câu ngắn
     * 3. Tách segments quá dài
     * 4. Fix timeline để không overlap
     */
    public static List<TranscriptSegmentDto> buildTimedSegments(
            List<TranscriptChunkDto> chunks,
            String transcript,
            String language) {

        if (chunks == null || chunks.isEmpty()) {
            return Collections.emptyList();
        }

        List<TranscriptSegmentDto> segments = new ArrayList<>();

        // Normalize chunks: ensure thời gian hợp lệ
        List<TranscriptChunkDto> cleanedChunks = normalizeChunks(chunks);
        if (cleanedChunks.isEmpty()) {
            return segments;
        }

        // Nhóm chunks thành câu
        List<List<TranscriptChunkDto>> sentenceGroups = groupChunksBySentences(cleanedChunks, language);

        // Gộp các câu ngắn và tách dài
        List<List<TranscriptChunkDto>> mergedGroups = mergeAndSplitGroups(sentenceGroups);

        // Build segments từ groups
        int segmentOrder = 1;
        for (List<TranscriptChunkDto> group : mergedGroups) {
            if (group.isEmpty()) {
                continue;
            }

            // Lấy start từ chunk đầu, end từ chunk cuối
            double startSec = group.get(0).start;
            double endSec = group.get(group.size() - 1).end;

            // Kiểm tra overlap với segment trước
            if (!segments.isEmpty()) {
                TranscriptSegmentDto prevSegment = segments.get(segments.size() - 1);
                if (startSec < prevSegment.endSec) {
                    startSec = prevSegment.endSec + 0.1;
                }
            }

            // Kiểm tra duration hợp lệ
            if (endSec <= startSec) {
                endSec = startSec + 1.0;
            }

            // Xây text từ chunks
            StringBuilder segmentText = new StringBuilder();
            for (TranscriptChunkDto chunk : group) {
                if (chunk.text != null && !chunk.text.isEmpty()) {
                    if (segmentText.length() > 0) {
                        segmentText.append(" ");
                    }
                    segmentText.append(chunk.text);
                }
            }

            String finalText = segmentText.toString().trim();
            if (finalText.isEmpty()) {
                continue;
            }

            TranscriptSegmentDto segment = new TranscriptSegmentDto(
                    startSec,
                    endSec,
                    finalText,
                    segmentOrder++);

            segments.add(segment);
        }

        return segments;
    }

    /**
     * Normalize chunks: kiểm tra và fix thời gian
     */
    private static List<TranscriptChunkDto> normalizeChunks(List<TranscriptChunkDto> chunks) {
        List<TranscriptChunkDto> result = new ArrayList<>();
        double prevEndTime = 0;

        for (TranscriptChunkDto chunk : chunks) {
            if (chunk == null || chunk.text == null || chunk.text.trim().isEmpty()) {
                continue;
            }

            double start = chunk.start != null ? chunk.start : prevEndTime;
            double duration = chunk.duration != null ? chunk.duration : 0.5;

            // Đảm bảo duration tối thiểu
            if (duration < MIN_CHUNK_DURATION) {
                duration = MIN_CHUNK_DURATION;
            }

            double end = start + duration;

            // Fix overlap
            if (start < prevEndTime) {
                start = prevEndTime;
                end = start + duration;
            }

            TranscriptChunkDto normalized = new TranscriptChunkDto(chunk.text, start, duration, end);
            result.add(normalized);
            prevEndTime = end;
        }

        return result;
    }

    /**
     * Nhóm chunks thành các câu dựa trên boundary detection
     */
    private static List<List<TranscriptChunkDto>> groupChunksBySentences(
            List<TranscriptChunkDto> chunks,
            String language) {

        List<List<TranscriptChunkDto>> groups = new ArrayList<>();
        List<TranscriptChunkDto> currentGroup = new ArrayList<>();

        for (TranscriptChunkDto chunk : chunks) {
            currentGroup.add(chunk);

            // Kiểm tra xem chunk này kết thúc câu không
            if (chunk.text != null && isSentenceEnd(chunk.text, language)) {
                groups.add(new ArrayList<>(currentGroup));
                currentGroup.clear();
            }
        }

        // Add group cuối cùng nếu có
        if (!currentGroup.isEmpty()) {
            groups.add(currentGroup);
        }

        return groups;
    }

    /**
     * Kiểm tra xem text kết thúc một câu không
     */
    private static boolean isSentenceEnd(String text, String language) {
        if (text == null || text.isEmpty()) {
            return false;
        }

        text = text.trim();

        // 1. Kiểm tra dấu câu kết thúc câu chuẩn (English/International)
        // Hỗ trợ cả trường hợp có dấu ngoặc kép hoặc khoảng trắng sau dấu câu
        if (text.matches(".*[.!?][\"']?\\s*$")) {
            return true;
        }

        // 2. Tách theo newline (YouTube thường ngắt đoạn tại đây)
        if (text.contains("\n")) {
            return true;
        }

        return false;
    }

    /**
     * Gộp các group ngắn, tách các group dài
     */
    private static List<List<TranscriptChunkDto>> mergeAndSplitGroups(
            List<List<TranscriptChunkDto>> groups) {

        List<List<TranscriptChunkDto>> result = new ArrayList<>();

        for (List<TranscriptChunkDto> group : groups) {
            // Tính duration của group
            if (group.isEmpty()) {
                continue;
            }

            double start = group.get(0).start;
            double end = group.get(group.size() - 1).end;
            double duration = end - start;

            // Nếu quá ngắn, thử gộp với group trước
            if (duration < MIN_SEGMENT_DURATION && !result.isEmpty()) {
                // Gộp với group cuối cùng
                result.get(result.size() - 1).addAll(group);
            }
            // Nếu quá dài, tách thành nhiều group
            else if (duration > MAX_SEGMENT_DURATION) {
                List<List<TranscriptChunkDto>> splits = splitLongGroup(group);
                result.addAll(splits);
            }
            // Bình thường
            else {
                result.add(group);
            }
        }

        return result;
    }

    /**
     * Tách một group dài thành nhiều group ngắn hơn
     */
    private static List<List<TranscriptChunkDto>> splitLongGroup(List<TranscriptChunkDto> group) {
        List<List<TranscriptChunkDto>> splits = new ArrayList<>();

        if (group.isEmpty()) {
            return splits;
        }

        List<TranscriptChunkDto> currentSplit = new ArrayList<>();
        double currentDuration = 0;

        for (TranscriptChunkDto chunk : group) {
            double chunkDuration = chunk.duration != null ? chunk.duration : 1.0;

            if (currentDuration + chunkDuration > MAX_SEGMENT_DURATION && !currentSplit.isEmpty()) {
                // Start new split
                splits.add(new ArrayList<>(currentSplit));
                currentSplit.clear();
                currentDuration = 0;
            }

            currentSplit.add(chunk);
            currentDuration += chunkDuration;
        }

        // Add last split
        if (!currentSplit.isEmpty()) {
            splits.add(currentSplit);
        }

        return splits;
    }

    /**
     * Kiểm tra xem transcript có chứa tiếng Hàn không
     */
    public static boolean isKoreanText(String text) {
        if (text == null || text.isEmpty()) {
            return false;
        }

        // Kiểm tra ký tự Hàn (Hangul)
        Pattern koreanPattern = Pattern.compile("[가-힣]");
        return koreanPattern.matcher(text).find();
    }

    /**
     * Estimate language từ transcript text
     */
    public static String estimateLanguage(String text) {
        if (text == null || text.isEmpty()) {
            return "unknown";
        }

        // Kiểm tra Hàn
        if (isKoreanText(text)) {
            return "ko";
        }

        // Kiểm tra Nhật
        Pattern japanesePattern = Pattern.compile("[\\u3040-\\u309F\\u30A0-\\u30FF\\u4E00-\\u9FFF]");
        if (japanesePattern.matcher(text).find()) {
            return "ja";
        }

        // Kiểm tra Trung
        Pattern chinesePattern = Pattern.compile("[\\u4E00-\\u9FFF]");
        if (chinesePattern.matcher(text).find()) {
            return "zh";
        }

        // Mặc định Anh
        return "en";
    }
}
