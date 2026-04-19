package com.example.DATN.controller;

import com.example.DATN.dto.CreateSupportTicketRequest;
import com.example.DATN.entity.SupportTicket;
import com.example.DATN.service.UserSupportService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

/**
 * Public controller for Support-related information (FAQ, Topics).
 */
@RestController
@RequestMapping("/api/support")
public class SupportPublicController {

    private final UserSupportService userSupportService;

    public SupportPublicController(UserSupportService userSupportService) {
        this.userSupportService = userSupportService;
    }

    @GetMapping("/faq")
    public List<Map<String, String>> getFAQ() {
        return Arrays.asList(
            Map.of(
                "question", "Tôi quên mật khẩu, phải làm gì?",
                "answer", "Vào trang Đăng nhập, nhấn \"Quên mật khẩu?\" rồi nhập email đã đăng ký. Hệ thống sẽ gửi link đặt lại mật khẩu trong vòng vài phút. Kiểm tra cả hộp thư Spam nếu không thấy."
            ),
            Map.of(
                "question", "Tôi đã thanh toán Premium nhưng tài khoản chưa được nâng cấp?",
                "answer", "Sau khi thanh toán thành công, tài khoản thường được nâng cấp ngay lập tức. Nếu sau 15 phút vẫn chưa thấy thay đổi, hãy thử đăng xuất và đăng nhập lại."
            ),
            Map.of(
                "question", "Làm sao để xóa tài khoản?",
                "answer", "Vào Cài đặt → Tài khoản → Xóa tài khoản. Lưu ý dữ liệu học tập sẽ bị xóa vĩnh viễn và không thể khôi phục."
            ),
            Map.of(
                "question", "Tính năng Spaced Repetition hoạt động như thế nào?",
                "answer", "Hệ thống theo dõi các từ bạn đã học và nhắc lại đúng lúc bạn sắp quên — dựa trên thuật toán ghi nhớ khoa học SM-2."
            )
        );
    }

    @GetMapping("/topics")
    public List<String> getTopics() {
        return Arrays.asList(
            "Tài khoản & đăng nhập",
            "Thanh toán & Premium",
            "Nội dung học tập",
            "Tính năng ứng dụng",
            "Báo lỗi ứng dụng",
            "Khác"
        );
    }

    /**
     * Public submission endpoint for support tickets.
     */
    @PostMapping("/tickets")
    public ResponseEntity<?> submitTicket(
            @RequestBody CreateSupportTicketRequest request,
            Authentication auth) {
        try {
            Long userId = getUserIdFromAuth(auth);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Vui lòng đăng nhập để gửi yêu cầu hỗ trợ.");
            }

            SupportTicket ticket = userSupportService.createTicket(
                    userId,
                    request.topic(), // Map topic to title in service
                    request.message()
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(ticket);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    private Long getUserIdFromAuth(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }
        try {
            return Long.parseLong(auth.getName());
        } catch (Exception e) {
            return null;
        }
    }
}
