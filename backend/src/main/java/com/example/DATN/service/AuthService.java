package com.example.DATN.service;

import com.example.DATN.dto.AuthLoginRequest;
import com.example.DATN.dto.AuthRegisterRequest;
import com.example.DATN.dto.AuthUserResponse;
import com.example.DATN.entity.User;
import com.example.DATN.entity.UserProfile;
import com.example.DATN.repository.UserProfileRepository;
import com.example.DATN.repository.UserRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import java.util.Collections;
import java.util.Date;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
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
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Value("${datn.google.client-id}")
    private String googleClientId;

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
            EmailService emailService) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.emailService = emailService;
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
        user.password = passwordEncoder.encode(password);
        user.role = "USER";
        user.isActive = true;
        user.createdAt = new Date();
        user.deletedAt = null;

        User savedUser = userRepository.save(user);

        UserProfile profile = new UserProfile();
        profile.user = savedUser;
        profile.fullName = fullName;
        profile.avatar = null;
        userProfileRepository.save(profile);

        return toResponse(savedUser, fullName);
    }

    private AuthUserResponse toResponse(User user) {
        String fullName = userProfileRepository.findByUserId(user.id.longValue())
                .map(profile -> profile.fullName)
                .orElse(user.username);
        return toResponse(user, fullName);
    }

    private AuthUserResponse toResponse(User user, String fullName) {
        return new AuthUserResponse(
                user.id == null ? null : user.id.longValue(),
                defaultString(user.username, ""),
                defaultString(fullName, defaultString(user.username, "")),
                defaultString(user.email, ""),
                defaultString(user.role, "USER"));
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
    public void resetPassword(com.example.DATN.dto.ResetPasswordRequest request) {
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
     * Luồng UC_DangNhap_Google:
     * 1. Xác thực ID Token gửi từ Frontend qua GoogleIdTokenVerifier.
     * 2. Lấy Email và thông tin cá nhân từ Token.
     * 3. Nếu Email chưa tồn tại, tự động tạo User mới.
     * 4. Trả về thông tin đăng nhập thành công.
     */
    public AuthUserResponse loginWithGoogle(String idTokenString) {
        try {
            if (idTokenString == null)
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token không được để trống.");

            String token = idTokenString.trim();
            // Sử dụng trực tiếp Client ID để tránh lỗi ký tự ẩn từ file cấu hình
            String clientId = "611258885638-83p3ulhfr9cra47glbp858hqtdf6p6l5.apps.googleusercontent.com";

            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(),
                    GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(clientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(token);
            if (idToken == null) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google ID Token không hợp lệ.");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String pictureUrl = (String) payload.get("picture");

            User user = userRepository.findActiveByEmail(email).orElseGet(() -> {
                // Tạo user mới nếu chưa có
                User newUser = new User();
                newUser.email = email;
                newUser.username = generateUsernameFromEmail(email);
                newUser.password = passwordEncoder.encode("google-oauth-" + java.util.UUID.randomUUID());
                newUser.role = "USER";
                newUser.isActive = true;
                newUser.createdAt = new Date();
                User saved = userRepository.save(newUser);

                UserProfile profile = new UserProfile();
                profile.user = saved;
                profile.fullName = name != null ? name : newUser.username;
                profile.avatar = pictureUrl;
                userProfileRepository.save(profile);

                return saved;
            });

            return toResponse(user);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Lỗi xác thực Google: " + e.getMessage());
        }
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
