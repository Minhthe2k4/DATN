package com.example.DATN.service;

import com.example.DATN.dto.VocabularyLessonDto;
import com.example.DATN.dto.VocabularyTopicDto;
import com.example.DATN.entity.Lesson;
import com.example.DATN.entity.Topic;
import com.example.DATN.entity.Vocabulary;
import com.example.DATN.repository.LessonRepository;
import com.example.DATN.repository.LessonVocabularyRepository;
import com.example.DATN.repository.TopicRepository;
import com.example.DATN.repository.VocabularyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service xử lý Use Case: Học từ vựng theo lộ trình hệ thống
 * (UC_HocTuVungHeThong)
 * Quản lý các Chủ đề (Topic) và Bài học (Lesson) đã được biên soạn sẵn.
 */
@Service
public class UserLessonService {
        @Autowired
        private TopicRepository topicRepository;

        @Autowired
        private LessonRepository lessonRepository;

        @Autowired
        private VocabularyRepository vocabularyRepository;

        @Autowired
        private LessonVocabularyRepository lessonVocabularyRepository;

        /**
         * Lấy danh sách tất cả các chủ đề học tập lớn
         * Giúp người dùng chọn hướng học tập mong muốn
         */
        public List<VocabularyTopicDto> getAllTopics() {
                List<Topic> topics = topicRepository.findAll();
                return topics.stream()
                                .map(this::convertTopicToDto)
                                .collect(Collectors.toList());
        }

        /**
         * Tìm thông tin chi tiết của một chủ đề cụ thể khi biết ID.
         */
        public VocabularyTopicDto getTopicById(Long topicId) {
                Optional<Topic> topic = topicRepository.findById(topicId);
                return topic.map(this::convertTopicToDto).orElse(null);
        }

        /**
         * Lấy toàn bộ nội dung của một bài học (bao gồm danh sách các từ vựng).
         * Khi người dùng nhấn vào một bài học cụ thể, hàm này sẽ trả về dữ liệu để hiển
         * thị.
         */
        public VocabularyLessonDto getLessonById(Long lessonId) {
                Optional<Lesson> lesson = lessonRepository.findById(lessonId);
                if (lesson.isEmpty()) {
                        return null;
                }

                Lesson l = lesson.get();
                List<VocabularyLessonDto.LessonWordDto> words = getWordsForLesson(lessonId);

                return new VocabularyLessonDto(
                                l.id,
                                l.name,
                                l.description,
                                words);
        }

        /**
         * Lấy danh sách tất cả các bài học thuộc về một chủ đề nhất định.
         * Giúp hiển thị danh sách các bài học (ví dụ: Lesson 1, Lesson 2...) trong một
         * Topic.
         */
        public List<VocabularyLessonDto> getTopicLessons(Long topicId) {
                List<Lesson> lessons = lessonRepository.findAll()
                                .stream()
                                .filter(l -> l.topic != null && l.topic.id.equals(topicId))
                                .collect(Collectors.toList());

                return lessons.stream()
                                .map(lesson -> new VocabularyLessonDto(
                                                lesson.id,
                                                lesson.name,
                                                lesson.description,
                                                getWordsForLesson(lesson.id)))
                                .collect(Collectors.toList());
        }

        /*
         * Tìm và lấy thông tin chi tiết từng từ vựng trong một bài học.
         * Nó kết nối với bảng trung gian lesson_vocabulary để biết bài học này chứa
         * những từ nào.
         */
        private List<VocabularyLessonDto.LessonWordDto> getWordsForLesson(Long lessonId) {
                // Lấy danh sách ID của các từ vựng thuộc bài học này
                List<Long> vocabIds = lessonVocabularyRepository.findVocabIdsByLessonId(lessonId);

                if (vocabIds.isEmpty()) {
                        return new ArrayList<>();
                }

                // Truy vấn thông tin chi tiết (nghĩa, ví dụ, phát âm) từ bảng Vocabulary
                List<Vocabulary> vocabs = vocabularyRepository.findAllById(vocabIds);

                return vocabs.stream()
                                .map(v -> new VocabularyLessonDto.LessonWordDto(
                                                v.word,
                                                v.pronunciation,
                                                v.meaningEn,
                                                v.meaningVi,
                                                v.example))
                                .collect(Collectors.toList());
        }

        /*
         * Chuyển đổi dữ liệu từ Entity sang DTO để hiển thị lên giao diện.
         * Tại đây, hệ thống cũng đếm số lượng từ vựng có trong mỗi bài học để người
         * dùng nắm bắt khối lượng.
         */
        private VocabularyTopicDto convertTopicToDto(Topic topic) {
                List<Lesson> lessons = lessonRepository.findAll()
                                .stream()
                                .filter(l -> l.topic != null && l.topic.id.equals(topic.id))
                                .collect(Collectors.toList());

                List<VocabularyTopicDto.LessonSummaryDto> lessonSummaries = lessons.stream()
                                .map(lesson -> {
                                        // Đếm số lượng từ vựng trong bài học này
                                        long wordCount = lessonVocabularyRepository.countByLessonId(lesson.id);
                                        return new VocabularyTopicDto.LessonSummaryDto(
                                                        lesson.id,
                                                        lesson.name,
                                                        lesson.description,
                                                        (int) wordCount);
                                })
                                .collect(Collectors.toList());

                return new VocabularyTopicDto(
                                topic.id,
                                topic.name,
                                topic.description,
                                "",
                                lessonSummaries);
        }
}
