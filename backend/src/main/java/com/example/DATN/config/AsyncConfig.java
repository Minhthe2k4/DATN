package com.example.DATN.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Bật tính năng @Async để xử lý bất đồng bộ.
 * Cần thiết để gọi Whisper API trong background mà không block request upload.
 */
@Configuration
@EnableAsync
public class AsyncConfig {
}
