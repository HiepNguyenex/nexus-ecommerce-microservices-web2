package com.rainbowforest.apigateway.filter;

import com.rainbowforest.apigateway.security.JwtProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.List;

@Component
public class JwtAuthenticationFilter implements GlobalFilter, Ordered {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Autowired
    private JwtProvider jwtProvider;

    @Autowired(required = false)
    private StringRedisTemplate redisTemplate;

    private static final List<String> PUBLIC_PATHS = Arrays.asList(
            "/api/accounts/login",
            "/api/accounts/register",
            "/api/accounts/registration",
            "/api/accounts/refresh",
            "/api/accounts/logout",
            "/api/shop/coupons/validate",
            "/api/shop/coupons/active",
            "/api/payment/stripe/webhook"
    );

    private static final String BLACKLIST_PREFIX = "blacklist:";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();
        String method = request.getMethod().name();

        logger.info("Gateway nhận request: {} [{}]", path, method);

        if (method.equalsIgnoreCase("OPTIONS")) {
            return chain.filter(exchange);
        }

        boolean isPublic = PUBLIC_PATHS.contains(path) ||
                (method.equalsIgnoreCase("GET") && (path.startsWith("/api/catalog") || path.startsWith("/api/review")));

        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            if (!jwtProvider.validateToken(token)) {
                logger.warn("Token không hợp lệ cho request: {}", path);
                if (!isPublic) {
                    return onError(exchange, HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ hoặc đã hết hạn");
                }
                return chain.filter(exchange);
            }

            // Kiểm tra token có trong blacklist (đã logout) không
            if (isTokenBlacklisted(token)) {
                logger.warn("Token đã bị blacklist (đã logout): {}", path);
                return onError(exchange, HttpStatus.UNAUTHORIZED, "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại");
            }

            String username = jwtProvider.getUsername(token);
            List<String> roles = jwtProvider.getRoles(token);
            String rolesStr = String.join(",", roles);
            String userId = jwtProvider.getUserId(token);

            logger.info("Token hợp lệ. User: {}, Roles: {}", username, rolesStr);

            // Kiểm tra quyền ADMIN cho các endpoint nhạy cảm
            boolean isOrderAdminPath = path.equalsIgnoreCase("/api/shop/orders") || path.equalsIgnoreCase("/api/shop/orders/") || !method.equalsIgnoreCase("GET");
            if ((path.startsWith("/api/catalog") && !method.equalsIgnoreCase("GET")) ||
                (path.startsWith("/api/shop/orders") && isOrderAdminPath && !roles.contains("ROLE_ADMIN"))) {
                if (!roles.contains("ROLE_ADMIN")) {
                    logger.warn("User {} không có quyền admin để truy cập {}", username, path);
                    return onError(exchange, HttpStatus.FORBIDDEN, "Bạn không có quyền thực hiện hành động này");
                }
            }

            // Forward user info headers to downstream services
            ServerHttpRequest mutatedRequest = request.mutate()
                    .header("X-User-Name", username)
                    .header("X-User-Roles", rolesStr)
                    .header("X-User-Id", userId != null ? userId : "")
                    .build();

            return chain.filter(exchange.mutate().request(mutatedRequest).build());
        } else {
            if (!isPublic) {
                logger.warn("Thiếu Authorization header cho request yêu cầu xác thực: {}", path);
                return onError(exchange, HttpStatus.UNAUTHORIZED, "Bạn cần đăng nhập để thực hiện hành động này");
            }
        }

        return chain.filter(exchange);
    }

    private boolean isTokenBlacklisted(String token) {
        if (redisTemplate == null || token == null) return false;
        try {
            String key = BLACKLIST_PREFIX + token;
            return Boolean.TRUE.equals(redisTemplate.hasKey(key));
        } catch (Exception e) {
            logger.warn("Redis check failed for blacklist (Redis may be down): {}", e.getMessage());
            return false;
        }
    }

    private Mono<Void> onError(ServerWebExchange exchange, HttpStatus status, String message) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        response.getHeaders().add("Content-Type", "application/json; charset=UTF-8");
        String body = String.format("{\"error\": \"%s\", \"status\": %d}", message, status.value());
        return response.writeWith(Mono.just(response.bufferFactory().wrap(body.getBytes())));
    }

    @Override
    public int getOrder() {
        return 0;
    }
}
