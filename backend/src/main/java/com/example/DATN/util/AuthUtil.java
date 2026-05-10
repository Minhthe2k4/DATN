package com.example.DATN.util;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.core.Authentication;

import com.example.DATN.service.common.CustomUserDetails;

/**
 * Utility class for extracting the authenticated user's ID from a request.
 *
 * <p>
 * This project uses a custom "Bearer {userId}" Authorization scheme where
 * the token payload is simply the numeric user ID. This helper centralizes
 * the extraction logic so that every controller uses the same approach.
 * </p>
 *
 * <p>
 * Extraction order:
 * <ol>
 * <li>Spring {@link Authentication} principal name (set by the security filter
 * chain)</li>
 * <li>Raw "Authorization: Bearer {userId}" HTTP header (fallback for
 * unauthenticated contexts)</li>
 * </ol>
 * Returns {@code null} when neither source yields a valid ID.
 * </p>
 */
public final class AuthUtil {

    private AuthUtil() {
    }

    /**
     * Extract a user ID from the Spring {@link Authentication} object or from the
     * raw {@code Authorization: Bearer <userId>} request header.
     *
     * @param auth    Spring Security authentication (may be {@code null})
     * @param request the current HTTP request (must not be {@code null})
     * @return the numeric user ID, or {@code null} if it cannot be resolved
     */
    public static Long getUserId(Authentication auth, HttpServletRequest request) {
        // 1. Try Spring Security principal (populated by JwtFilter)
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof CustomUserDetails) {
            return ((CustomUserDetails) auth.getPrincipal()).getUserId();
        }

        // 2. Fallback: if auth name is set but not as CustomUserDetails (rare but
        // possible if principal is string)
        if (auth != null && auth.isAuthenticated() && auth.getName() != null
                && !auth.getName().equals("anonymousUser")) {
            try {
                return Long.parseLong(auth.getName());
            } catch (NumberFormatException ignored) {
            }
        }

        // 3. Fallback: Raw "Authorization: Bearer {userId}" HTTP header
        if (request != null) {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7).trim();
                try {
                    return Long.parseLong(token);
                } catch (NumberFormatException ignored) {
                }
            }
        }

        return null;
    }

    /**
     * Convenience overload for controllers that do not receive an
     * {@link Authentication} parameter.
     */
    public static Long getUserId(HttpServletRequest request) {
        return getUserId(null, request);
    }
}
