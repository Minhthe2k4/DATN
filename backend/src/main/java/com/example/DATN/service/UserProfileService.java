package com.example.DATN.service;

import com.example.DATN.dto.UserProfileDto;
import com.example.DATN.entity.User;
import com.example.DATN.entity.UserProfile;
import com.example.DATN.entity.UserStats;
import com.example.DATN.entity.UserSubscription;
import com.example.DATN.repository.UserProfileRepository;
import com.example.DATN.repository.UserRepository;
import com.example.DATN.repository.UserStatsRepository;
import com.example.DATN.repository.UserSubscriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Date;
import java.util.List;

@Service
public class UserProfileService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Autowired
    private UserStatsRepository userStatsRepository;

    @Autowired
    private UserSubscriptionRepository userSubscriptionRepository;

    @Autowired
    private com.example.DATN.repository.LeaderboardRepository leaderboardRepository;

    @Autowired
    private UserStatsService userStatsService;

    public UserProfileDto getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    UserProfile newProfile = new UserProfile();
                    newProfile.user = user;
                    return newProfile;
                });

        // Đảm bảo có UserStats và đồng bộ dữ liệu
        userStatsService.syncStats(userId);
        UserStats stats = userStatsRepository.findByUser_Id(userId).orElseThrow();

        List<UserSubscription> subscriptions = userSubscriptionRepository.findActiveSubscriptionsByUserId(userId,
                new Date());
        boolean isPremium = !subscriptions.isEmpty();
        Date premiumUntil = isPremium ? subscriptions.get(0).endDate : null;

        Integer rank = leaderboardRepository.findByUser_Id(userId)
                .map(lb -> lb.rank)
                .orElse(null);

        return new UserProfileDto(
                user.id,
                user.username,
                user.email,
                profile.fullName,
                profile.avatar,
                user.role,
                user.createdAt,
                stats.totalWords,
                stats.learnedWords,
                stats.streakDays,
                stats.accuracy,
                isPremium,
                premiumUntil,
                stats.totalStudyTime != null ? stats.totalStudyTime : 0.0,
                rank);
    }

    public UserProfileDto updateProfile(Long userId, String fullName, String avatar) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    UserProfile newProfile = new UserProfile();
                    newProfile.user = user;
                    return newProfile;
                });

        if (fullName != null) {
            profile.fullName = fullName;
        }
        if (avatar != null) {
            profile.avatar = avatar;
        }

        userProfileRepository.save(profile);
        return getProfile(userId);
    }
}
