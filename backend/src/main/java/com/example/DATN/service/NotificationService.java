package com.example.DATN.service;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * Gửi thông báo cho tất cả người dùng (Public)
     */
    public void sendPublicNotification(String type, String message, Object data) {
        NotificationPayload payload = new NotificationPayload(type, message, data);
        messagingTemplate.convertAndSend("/topic/public", payload);
    }

    /**
     * Gửi thông báo cho một người dùng cụ thể
     */
    public void sendPrivateNotification(Long userId, String type, String message, Object data) {
        NotificationPayload payload = new NotificationPayload(type, message, data);
        // Gửi qua topic cụ thể để đảm bảo nhận được ngay cả khi chưa có Principal
        messagingTemplate.convertAndSend("/topic/notifications/" + userId, payload);
    }

    /**
     * Gửi cập nhật cho Admin
     */
    public void sendAdminNotification(String type, String message, Object data) {
        NotificationPayload payload = new NotificationPayload(type, message, data);
        messagingTemplate.convertAndSend("/topic/admin", payload);
    }

    /**
     * Gửi cập nhật bảng xếp hạng
     */
    public void broadcastLeaderboardUpdate(Object leaderboardData) {
        messagingTemplate.convertAndSend("/topic/leaderboard", leaderboardData);
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class NotificationPayload {
        private String type; // Ví dụ: SUPPORT_REPLY, LEADERBOARD_UPDATE, PAYMENT_SUCCESS
        private String message;
        private Object data;
    }
}
