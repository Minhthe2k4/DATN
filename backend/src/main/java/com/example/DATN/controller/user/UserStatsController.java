package com.example.DATN.controller.user;

import com.example.DATN.service.user.UserStatsService;
import com.example.DATN.util.AuthUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user/stats")
public class UserStatsController {

    @Autowired
    private UserStatsService userStatsService;

    @PostMapping("/heartbeat")
    public ResponseEntity<?> heartbeat(Authentication auth, HttpServletRequest request) {
        Long userId = AuthUtil.getUserId(auth, request);
        if (userId == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        userStatsService.recordHeartbeat(userId);
        return ResponseEntity.ok().build();
    }

    @org.springframework.web.bind.annotation.GetMapping("/weekly")
    public ResponseEntity<?> getWeeklyStats(Authentication auth, HttpServletRequest request) {
        Long userId = AuthUtil.getUserId(auth, request);
        if (userId == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        return ResponseEntity.ok(userStatsService.getWeeklyStudyStats(userId));
    }
}
