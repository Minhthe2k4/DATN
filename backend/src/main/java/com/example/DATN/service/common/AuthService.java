package com.example.DATN.service.common;

import com.example.DATN.dto.common.AuthLoginRequest;
import com.example.DATN.dto.common.AuthRegisterRequest;
import com.example.DATN.dto.common.AuthUserResponse;
import com.example.DATN.dto.common.ResetPasswordRequest;
import com.example.DATN.entity.User;
import com.example.DATN.entity.UserProfile;
import com.example.DATN.repository.user.UserProfileRepository;
import com.example.DATN.repository.user.UserRepository;
import java.util.Date;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * Service layer xử lý logic nghiệp vụ cho Use Case: Xác thực người dùng
 * (UC_Authentication).
 * Đóng vai trò trung gian:
 * - Nhận dữ liệu DTO từ Controller.
 * - Thực hiện kiểm tra nghiệp vụ (Mã hóa mật khẩu, kiểm tra email tồn tại).
 * - Tương tác với Repository (UserRepository, UserProfileRepository) để
 * lưu/truy vấn dữ liệu.
 * - Trả về kết quả đã được xử lý (AuthUserResponse) kèm theo JWT Token.
 */
@Service
public class AuthService {
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final EmailService emailService;
    private final com.example.DATN.util.JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    private static class OtpData {
        String otp;
        long expiryTime;

        OtpData(String otp, long expiryTime) {
            this.otp = otp;
            this.expiryTime = expiryTime;
        }
    }

    // Lưu trữ OTP tạm thời: Email -> {OTP, ExpiryTime}
    private final java.util.Map<String, OtpData> otpStorage = new java.util.concurrent.ConcurrentHashMap<>();

    public AuthService(UserRepository userRepository, UserProfileRepository userProfileRepository,
            EmailService emailService, PasswordEncoder passwordEncoder, com.example.DATN.util.JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // Kiểm tra và làm sạch dữ liệu đầu vào
    private String normalizeRequired(String value, String message) {
        String normalized = defaultString(value, "").trim();
        if (normalized.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
        return normalized;
    }

    private String defaultString(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value;
    }

    private AuthUserResponse toResponse(User user, String fullName, String avatar) {
        return new AuthUserResponse(
                user.id == null ? null : user.id.longValue(),
                defaultString(user.username, ""),
                defaultString(fullName, defaultString(user.username, "")),
                defaultString(user.email, ""),
                defaultString(user.role, "USER"),
                // Tạo JWT Token thông qua JwtUtil
                jwtUtil.generateToken(user.email),
                avatar);
    }

    private AuthUserResponse toResponse(User user) {
        UserProfile profile = userProfileRepository.findFirstByUser_Id(user.id.longValue()).orElse(null);
        String fullName = profile != null ? profile.fullName : user.username;
        String avatar = profile != null ? profile.avatar : null;
        return toResponse(user, fullName, avatar);
    }

    public AuthUserResponse login(AuthLoginRequest request) {
        String email = normalizeRequired(request == null ? null : request.email(), "Email is required");
        String password = normalizeRequired(request == null ? null : request.password(), "Password is required");

        // Tìm người dùng theo email
        User user = userRepository.findActiveByEmail(email)
                .orElseThrow(
                        () -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không đúng."));

        if (!Boolean.TRUE.equals(user.isActive)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tài khoản đã bị khóa.");
        }

        if (!passwordMatches(password, user.password)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không đúng.");
        }

        // Tạo token và trả về thông tin người dùng với token cho Controller
        return toResponse(user);
    }

    // Hàm sinh Username tự động:
    // Tách phần prefix của Email và xử lý trùng lặp bằng cách thêm hậu tố số.
    private String generateUsernameFromEmail(String email) {
        String base = email.split("@")[0].trim().toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9._-]", "");
        if (base.isBlank()) {
            base = "user";
        }

        String candidate = base;
        int index = 1;
        while (userRepository.existsActiveByUsername(candidate)) {
            candidate = base + index;
            index++;
        }
        return candidate;
    }

    public AuthUserResponse register(AuthRegisterRequest request) {
        // Validate dữ liệu đầu vào.
        String fullName = normalizeRequired(request == null ? null : request.fullName(), "Full name is required");
        String email = normalizeRequired(request == null ? null : request.email(), "Email is required");
        String password = normalizeRequired(request == null ? null : request.password(), "Password is required");
        String phoneNumber = normalizeRequired(request == null ? null : request.phoneNumber(),
                "Phone number is required");

        if (password.length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu phải có ít nhất 6 ký tự.");
        }

        // Kiểm tra email đã tồn tại qua UserRepository.
        if (userRepository.existsActiveByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email đã được đăng ký.");
        }

        // Tạo username tự động từ email.
        String username = generateUsernameFromEmail(email);

        User user = new User();
        user.username = username;
        user.email = email;
        user.phoneNumber = phoneNumber;
        user.password = passwordEncoder.encode(password);
        user.role = "USER";
        user.isActive = false; // Mặc định khóa cho đến khi xác thực OTP
        user.createdAt = new Date();
        user.deletedAt = null;

        User savedUser = userRepository.save(user);

        UserProfile profile = new UserProfile();
        profile.user = savedUser;
        profile.fullName = fullName;
        profile.avatar = null;
        userProfileRepository.save(profile);

        // Gửi OTP xác thực tài khoản mới
        String otp = String.format("%06d", new java.util.Random().nextInt(999999));
        long expiryTime = System.currentTimeMillis() + (10 * 60 * 1000); // 10 phút
        otpStorage.put(email, new OtpData(otp, expiryTime));
        emailService.sendOtpEmail(email, otp);

        return toResponse(savedUser, fullName, null);
    }

    // Kích hoạt tài khoản bằng mã OTP gửi qua email
    public AuthUserResponse activateAccount(String email, String otp) {
        email = normalizeRequired(email, "Email is required");
        otp = normalizeRequired(otp, "OTP is required");

        if (!verifyOtp(email, otp)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã OTP không chính xác hoặc đã hết hạn.");
        }

        User user = userRepository.findActiveByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Người dùng không tồn tại."));

        user.isActive = true;
        userRepository.save(user);
        otpStorage.remove(email);

        return toResponse(user);
    }

    // Logic đối soát mật khẩu:
    // Hỗ trợ kiểm tra cả mật khẩu đã mã hóa BCrypt và mật khẩu thô (nếu có).
    private boolean passwordMatches(String rawPassword, String storedPassword) {
        String safeStored = defaultString(storedPassword, "");
        if (safeStored.startsWith("$2")) {
            return passwordEncoder.matches(rawPassword, safeStored);
        }
        return rawPassword.equals(safeStored);
    }

    // Quên mật khẩu
    public void forgotPassword(String email) {
        email = normalizeRequired(email, "Email is required");

        if (!userRepository.existsActiveByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Email không tồn tại trong hệ thống.");
        }

        String otp = String.format("%06d", new java.util.Random().nextInt(999999));
        long expiryTime = System.currentTimeMillis() + (5 * 60 * 1000); // 5 phút

        // Lưu trữ OTP tạm thời
        otpStorage.put(email, new OtpData(otp, expiryTime));

        // Gửi mail
        emailService.sendOtpEmail(email, otp);
    }

    // Xác thực OTP
    public boolean verifyOtp(String email, String otp) {
        email = normalizeRequired(email, "Email is required");
        otp = normalizeRequired(otp, "OTP is required");

        OtpData storedData = otpStorage.get(email);
        if (storedData == null)
            return false;

        // Kiểm tra hết hạn
        if (System.currentTimeMillis() > storedData.expiryTime) {
            otpStorage.remove(email);
            return false;
        }

        return otp.equals(storedData.otp);
    }

    // Đổi mật khẩu
    public void resetPassword(ResetPasswordRequest request) {
        String email = normalizeRequired(request.email(), "Email is required");
        String otp = normalizeRequired(request.otp(), "OTP is required");
        String newPassword = normalizeRequired(request.newPassword(), "New password is required");

        if (newPassword.length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu mới phải có ít nhất 6 ký tự.");
        }

        if (!verifyOtp(email, otp)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã OTP không chính xác hoặc đã hết hạn.");
        }

        User user = userRepository.findActiveByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Người dùng không tồn tại."));

        user.password = passwordEncoder.encode(newPassword);
        userRepository.save(user);

        // Xóa OTP sau khi sử dụng
        otpStorage.remove(email);
    }

    // Lấy thông tin người dùng hiện tại dựa trên Authentication principal.
    public AuthUserResponse getCurrentUserResponse(org.springframework.security.core.Authentication auth) {
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof CustomUserDetails)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên làm việc không hợp lệ.");
        }

        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        User user = userRepository.findActiveById(userDetails.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Người dùng không tồn tại."));

        return toResponse(user);
    }

}
