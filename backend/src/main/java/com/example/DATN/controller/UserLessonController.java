package com.example.DATN.controller;

import com.example.DATN.dto.VocabularyLessonDto;
import com.example.DATN.dto.VocabularyTopicDto;
import com.example.DATN.service.UserLessonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user/lessons")
public class UserLessonController {
    @Autowired
    private UserLessonService userLessonService;

    @GetMapping("/topics")
    public ResponseEntity<List<VocabularyTopicDto>> getAllTopics() {
        try {
            List<VocabularyTopicDto> topics = userLessonService.getAllTopics();
            return ResponseEntity.ok(topics);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/topics/{topicId}")
    public ResponseEntity<VocabularyTopicDto> getTopicById(@PathVariable Long topicId) {
        try {
            VocabularyTopicDto topic = userLessonService.getTopicById(topicId);
            if (topic != null) {
                return ResponseEntity.ok(topic);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{lessonId}")
    public ResponseEntity<VocabularyLessonDto> getLessonById(@PathVariable Long lessonId) {
        try {
            VocabularyLessonDto lesson = userLessonService.getLessonById(lessonId);
            if (lesson != null) {
                return ResponseEntity.ok(lesson);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/topics/{topicId}/lessons")
    public ResponseEntity<List<VocabularyLessonDto>> getTopicLessons(@PathVariable Long topicId) {
        try {
            List<VocabularyLessonDto> lessons = userLessonService.getTopicLessons(topicId);
            return ResponseEntity.ok(lessons);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
