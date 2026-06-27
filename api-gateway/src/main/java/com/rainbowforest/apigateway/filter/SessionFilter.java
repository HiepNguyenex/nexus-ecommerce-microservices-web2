package com.rainbowforest.apigateway.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

public class SessionFilter implements GlobalFilter, Ordered {

    private static final Logger logger = LoggerFactory.getLogger(SessionFilter.class);

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String username = exchange.getRequest().getHeaders().getFirst("X-User-Name");
        if (username != null && !username.isEmpty()) {
            logger.info("Using authenticated username as Session/Cart ID: {}", username);
            ServerHttpRequest request = exchange.getRequest().mutate()
                    .header("Cookie", username)
                    .build();
            return chain.filter(exchange.mutate().request(request).build());
        }

        return exchange.getSession().flatMap(webSession -> {
            String sessionId = webSession.getId();
            logger.info("Session ID (anonymous): {}", sessionId);

            // Đính kèm sessionId vào header Cookie
            ServerHttpRequest request = exchange.getRequest().mutate()
                    .header("Cookie", sessionId)
                    .build();

            return chain.filter(exchange.mutate().request(request).build());
        });
    }

    @Override
    public int getOrder() {
        return 10;
    }
}