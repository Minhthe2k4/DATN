package com.example.DATN.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtpEmail(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("nguyenminhthe2hk4@gmail.com");
        message.setTo(to);
        message.setSubject("Mã OTP khôi phục mật khẩu - VocaSmart");
        message.setText("Chào bạn,\n\nMã OTP của bạn là: " + otp + "\n\nMã này có hiệu lực trong 5 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.\n\nTrân trọng,\nĐội ngũ VocaSmart");
        
        mailSender.send(message);
    }
}
