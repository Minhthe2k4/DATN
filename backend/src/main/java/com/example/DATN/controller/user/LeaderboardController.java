package com.example.DATN.controller.user;

import com.example.DATN.dto.user.LeaderboardDto;
import com.example.DATN.entity.Leaderboard;
import com.example.DATN.entity.UserStats;
import com.example.DATN.repository.user.LeaderboardRepository;
import com.example.DATN.repository.user.UserProfileRepository;
import com.example.DATN.repository.user.UserStatsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user/leaderboard")
public class LeaderboardController {

    @Autowired
    private LeaderboardRepository leaderboardRepository;

    @Autowired
    private UserStatsRepository userStatsRepository;

    @Autowired
    private UserProfileRepository userProfileRepository;

    @GetMapping
    public ResponseEntity<List<LeaderboardDto>> getLeaderboard() {
        List<Leaderboard> leaderboard = leaderboardRepository.findAll(Sort.by(Sort.Direction.ASC, "rank"));

        List<LeaderboardDto> dtos = leaderboard.stream().map(lb -> {
            UserStats stats = userStatsRepository.findFirstByUser_Id(lb.user.id).orElse(null);
            String avatar = userProfileRepository.findFirstByUser_Id(lb.user.id)
                    .map(p -> p.avatar)
                    .orElse(lb.user.username != null ? lb.user.username.substring(0, 1).toUpperCase() : "U");

            return new LeaderboardDto(
                    lb.rank,
                    lb.user.username,
                    lb.user.email,
                    avatar,
                    lb.score,
                    stats != null && stats.totalStudyTime != null ? stats.totalStudyTime : 0.0,
                    stats != null && stats.streakDays != null ? stats.streakDays : 0);
        }).collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }
}
