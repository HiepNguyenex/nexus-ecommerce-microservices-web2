package com.rainbowforest.apigateway.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import reactor.core.publisher.Mono;

/**
 * Rate Limiting Configuration sử dụng Spring Cloud Gateway RequestRateLimiter
 * với Redis Token Bucket algorithm.
 *
 * Giới hạn: 10 request/giây mỗi IP (burst tối đa 20 request).
 * Config chi tiết trong application.properties.
 */
@Configuration
public class RateLimiterConfig {

    private static final Logger logger = LoggerFactory.getLogger(RateLimiterConfig.class);

    /**
     * KeyResolver theo địa chỉ IP của client.
     * Mỗi IP riêng biệt sẽ có bucket rate limit riêng trong Redis.
     */
    @Bean
    @Primary
    public KeyResolver ipKeyResolver() {
        return exchange -> {
            String ip = exchange.getRequest().getRemoteAddress() != null
                    ? exchange.getRequest().getRemoteAddress().getHostString()
                    : "unknown";
            logger.debug("Rate limit check for IP: {}", ip);
            return Mono.just(ip);
        };
    }

    /**
     * KeyResolver theo username (từ JWT header X-User-Name).
     * Dùng cho các route cần rate limit theo user, không phải IP.
     */
    @Bean
    public KeyResolver userKeyResolver() {
        return exchange -> {
            String user = exchange.getRequest().getHeaders().getFirst("X-User-Name");
            if (user != null && !user.isBlank()) {
                return Mono.just(user);
            }
            // Fallback về IP nếu chưa đăng nhập
            String ip = exchange.getRequest().getRemoteAddress() != null
                    ? exchange.getRequest().getRemoteAddress().getHostString()
                    : "anonymous";
            return Mono.just("anon:" + ip);
        };
    }

    @Bean
    public org.springframework.cloud.gateway.filter.ratelimit.RedisRateLimiter redisRateLimiter() {
        return new org.springframework.cloud.gateway.filter.ratelimit.RedisRateLimiter(10, 20);
    }
}

