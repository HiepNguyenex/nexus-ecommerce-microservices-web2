package com.rainbowforest.orderservice.feignclient;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Configuration
public class FeignConfig {

    private static final Logger log = LoggerFactory.getLogger(FeignConfig.class);

    /**
     * Interceptor để tự động đính kèm Authorization header từ request hiện tại
     * vào các FeignClient calls.
     * Điều này đảm bảo JWT token được truyền qua các service khi gọi OpenFeign.
     */
    @Bean
    public RequestInterceptor requestInterceptor() {
        return new RequestInterceptor() {
            @Override
            public void apply(RequestTemplate template) {
                ServletRequestAttributes attributes =
                        (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
                if (attributes != null) {
                    HttpServletRequest request = attributes.getRequest();
                    String authHeader = request.getHeader("Authorization");
                    if (authHeader != null && !authHeader.isBlank()) {
                        template.header("Authorization", authHeader);
                        log.debug("Feign: Forwarded Authorization header");
                    }
                    // Cũng forward các header X-User-* từ Gateway
                    String userName = request.getHeader("X-User-Name");
                    if (userName != null && !userName.isBlank()) {
                        template.header("X-User-Name", userName);
                    }
                    String userRoles = request.getHeader("X-User-Roles");
                    if (userRoles != null && !userRoles.isBlank()) {
                        template.header("X-User-Roles", userRoles);
                    }
                }
            }
        };
    }
}
