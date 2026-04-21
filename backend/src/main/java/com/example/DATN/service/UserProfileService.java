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
import java.util.Optional;

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

    public UserProfileDto getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    UserProfile newProfile = new UserProfile();
                    newProfile.user = user;
                    return newProfile;
                });

        UserStats stats = userStatsRepository.findByUser_Id(userId)
                .orElseGet(() -> {
                    UserStats newStats = new UserStats();
                    newStats.user = user;
                    newStats.learnedWords = 0;
                    newStats.totalWords = 0;
                    newStats.streakDays = 0;
                    newStats.accuracy = 0.0f;
                    return newStats;
                });

        List<UserSubscription> subscriptions = userSubscriptionRepository.findActiveSubscriptionsByUserId(userId, new Date());
        boolean isPremium = !subscriptions.isEmpty();
        Date premiumUntil = isPremium ? subscriptions.get(0).endDate : null;

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
                premiumUntil
        );
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
