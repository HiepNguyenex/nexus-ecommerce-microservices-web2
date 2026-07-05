package com.rainbowforest.userservice.service;

import com.rainbowforest.userservice.security.JwtProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class RefreshTokenService {

    private static final long REFRESH_TOKEN_VALIDITY_MS = 7 * 24 * 60 * 60 * 1000L; // 7 ngày
    private static final String REFRESH_PREFIX = "refresh:";
    private static final String BLACKLIST_PREFIX = "blacklist:";

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private JwtProvider jwtProvider;

    /**
     * Tạo Refresh Token, lưu vào Redis với key = refresh:<token>
     * value = username, TTL = 7 ngày
     */
    public String createRefreshToken(String username) {
        String refreshToken = UUID.randomUUID().toString();
        String key = REFRESH_PREFIX + refreshToken;
        redisTemplate.opsForValue().set(key, username, REFRESH_TOKEN_VALIDITY_MS, TimeUnit.MILLISECONDS);
        return refreshToken;
    }

    /**
     * Xác thực Refresh Token từ Redis.
     * Trả về username nếu token hợp lệ, null nếu không.
     */
    public String validateRefreshToken(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) return null;
        String key = REFRESH_PREFIX + refreshToken;
        String username = redisTemplate.opsForValue().get(key);
        if (username == null) return null; // token hết hạn hoặc không tồn tại

        // Xóa refresh token cũ (chỉ dùng 1 lần - rotation security)
        redisTemplate.delete(key);
        return username;
    }

    /**
     * Xóa Refresh Token khỏi Redis (khi logout hoặc refresh)
     */
    public void deleteRefreshToken(String refreshToken) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            String key = REFRESH_PREFIX + refreshToken;
            redisTemplate.delete(key);
        }
    }

    /**
     * Thêm Access Token vào blacklist (khi logout)
     * Token sẽ không còn dùng được cho đến khi hết hạn
     */
    public void blacklistAccessToken(String accessToken) {
        if (accessToken == null || accessToken.isBlank()) return;
        try {
            // Lấy thời gian hết hạn từ token để set TTL cho blacklist
            long expirationMs = jwtProvider.getExpirationMs(accessToken);
            long remainingTtl = expirationMs - System.currentTimeMillis();
            if (remainingTtl > 0) {
                String key = BLACKLIST_PREFIX + accessToken;
                redisTemplate.opsForValue().set(key, "blacklisted", remainingTtl, TimeUnit.MILLISECONDS);
            }
        } catch (Exception ignored) {
            // Nếu token không parse được, bỏ qua
        }
    }

    /**
     * Kiểm tra Access Token có trong blacklist không
     */
    public boolean isTokenBlacklisted(String accessToken) {
        if (accessToken == null || accessToken.isBlank()) return false;
        String key = BLACKLIST_PREFIX + accessToken;
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }
}
