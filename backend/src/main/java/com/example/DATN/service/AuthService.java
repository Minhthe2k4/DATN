package com.example.DATN.service;

import com.example.DATN.dto.AuthLoginRequest;
import com.example.DATN.dto.AuthRegisterRequest;
import com.example.DATN.dto.AuthUserResponse;
import com.example.DATN.entity.User;
import com.example.DATN.entity.UserProfile;
import com.example.DATN.repository.UserProfileRepository;
import com.example.DATN.repository.UserRepository;
import java.util.Date;
import java.util.Locale;
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
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthService(UserRepository userRepository, UserProfileRepository userProfileRepository) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
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
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không đúng."));

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
                defaultString(user.role, "USER")
        );
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
