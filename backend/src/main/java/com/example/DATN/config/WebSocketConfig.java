package com.example.DATN.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // /topic dùng cho broadcast (tất cả mọi người), /queue dùng cho thông báo riêng lẻ
        config.enableSimpleBroker("/topic", "/queue");
        // Các message gửi từ client lên sẽ có prefix /app
        config.setApplicationDestinationPrefixes("/app");
        // Prefix cho thông báo riêng tư (User-specific)
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Endpoint để frontend kết nối tới
        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173")
                .setAllowedOriginPatterns("*")
                .withSockJS(); // Fallback nếu trình duyệt không hỗ trợ WebSocket thuần
    }
}
