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
 * Service xử lý Use Case: Xác thực người dùng (UC_Authentication)
 * Bao gồm các luồng: Đăng nhập, Đăng ký và Quản lý phiên làm việc.
 */
@Service
public class AuthService {
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final EmailService emailService;
    private final com.example.DATN.util.JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    // Lưu trữ OTP tạm thời: Email -> {OTP, ExpiryTime}
    private static class OtpData {
        String otp;
        long expiryTime;

        OtpData(String otp, long expiryTime) {
            this.otp = otp;
            this.expiryTime = expiryTime;
        }
    }

    private final java.util.Map<String, OtpData> otpStorage = new java.util.concurrent.ConcurrentHashMap<>();

    public AuthService(UserRepository userRepository, UserProfileRepository userProfileRepository,
            EmailService emailService, PasswordEncoder passwordEncoder, com.example.DATN.util.JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Luồng chính của UC_DangNhap:
     * 1. Kiểm tra tính hợp lệ của dữ liệu đầu vào (Email, Password).
     * 2. Truy vấn người dùng đang hoạt động (isActive=true) từ bảng 'users'.
     * 3. Kiểm tra trạng thái tài khoản (có bị khóa hay không).
     * 4. Đối soát mật khẩu (hỗ trợ cả mã hóa BCrypt).
     * 5. Trả về thông tin phiên đăng nhập kèm Profile người dùng.
     */
    public AuthUserResponse login(AuthLoginRequest request) {
        String email = normalizeRequired(request == null ? null : request.email(), "Email is required");
        String password = normalizeRequired(request == null ? null : request.password(), "Password is required");

        User user = userRepository.findActiveByEmail(email)
                .orElseThrow(
                        () -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không đúng."));

        if (!Boolean.TRUE.equals(user.isActive)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tài khoản đã bị khóa.");
        }

        if (!passwordMatches(password, user.password)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không đúng.");
        }

        return toResponse(user);
    }

    /**
     * Luồng chính của UC_DangKy:
     * 1. Xác thực các ràng buộc dữ liệu (Độ dài mật khẩu, định dạng Email).
     * 2. Kiểm tra sự tồn tại của Email trong cơ sở dữ liệu (Tránh trùng lặp).
     * 3. Tự động sinh Username từ Email.
     * 4. Mã hóa mật khẩu bằng BCrypt trước khi lưu.
     * 5. Khởi tạo đồng thời bản ghi trong bảng 'users' và 'user_profiles'.
     */
    public AuthUserResponse register(AuthRegisterRequest request) {
        String fullName = normalizeRequired(request == null ? null : request.fullName(), "Full name is required");
        String email = normalizeRequired(request == null ? null : request.email(), "Email is required");
        String password = normalizeRequired(request == null ? null : request.password(), "Password is required");
        String phoneNumber = normalizeRequired(request == null ? null : request.phoneNumber(),
                "Phone number is required");

        if (password.length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mật khẩu phải có ít nhất 6 ký tự.");
        }

        if (userRepository.existsActiveByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email đã được đăng ký.");
        }

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

    /**
     * Kích hoạt tài khoản bằng mã OTP gửi qua email
     */
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

    private AuthUserResponse toResponse(User user) {
        UserProfile profile = userProfileRepository.findFirstByUser_Id(user.id.longValue()).orElse(null);
        String fullName = profile != null ? profile.fullName : user.username;
        String avatar = profile != null ? profile.avatar : null;
        return toResponse(user, fullName, avatar);
    }

    private AuthUserResponse toResponse(User user, String fullName, String avatar) {
        return new AuthUserResponse(
                user.id == null ? null : user.id.longValue(),
                defaultString(user.username, ""),
                defaultString(fullName, defaultString(user.username, "")),
                defaultString(user.email, ""),
                defaultString(user.role, "USER"),
                jwtUtil.generateToken(user.email),
                avatar);
    }

    /**
     * Logic đối soát mật khẩu:
     * Hỗ trợ kiểm tra cả mật khẩu đã mã hóa BCrypt và mật khẩu thô (nếu có).
     */
    private boolean passwordMatches(String rawPassword, String storedPassword) {
        String safeStored = defaultString(storedPassword, "");
        if (safeStored.startsWith("$2")) {
            return passwordEncoder.matches(rawPassword, safeStored);
        }
        return rawPassword.equals(safeStored);
    }

    /**
     * Hàm sinh Username tự động:
     * Tách phần prefix của Email và xử lý trùng lặp bằng cách thêm hậu tố số.
     */
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

    /**
     * Luồng UC_QuenMatKhau - Bước 1: Gửi OTP
     */
    public void forgotPassword(String email) {
        email = normalizeRequired(email, "Email is required");

        if (!userRepository.existsActiveByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Email không tồn tại trong hệ thống.");
        }

        String otp = String.format("%06d", new java.util.Random().nextInt(999999));
        long expiryTime = System.currentTimeMillis() + (5 * 60 * 1000); // 5 phút
        otpStorage.put(email, new OtpData(otp, expiryTime));

        // Gửi mail thực tế
        emailService.sendOtpEmail(email, otp);
    }

    /**
     * Luồng UC_QuenMatKhau - Bước 2: Xác thực OTP
     */
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

    /**
     * Luồng UC_QuenMatKhau - Bước 3: Đổi mật khẩu
     */
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

    /**
     * Lấy thông tin người dùng hiện tại dựa trên Authentication principal.
     * Được sử dụng bởi endpoint /api/auth/verify để đồng bộ phiên làm việc.
     */
    public AuthUserResponse getCurrentUserResponse(org.springframework.security.core.Authentication auth) {
        if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof CustomUserDetails)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Phiên làm việc không hợp lệ.");
        }

        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        User user = userRepository.findActiveById(userDetails.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Người dùng không tồn tại."));

        return toResponse(user);
    }

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
}
