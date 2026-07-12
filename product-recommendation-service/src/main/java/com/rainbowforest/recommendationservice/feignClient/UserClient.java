package com.rainbowforest.recommendationservice.feignClient;

import com.rainbowforest.recommendationservice.model.User;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * FeignClient gọi user-service qua Eureka Service Discovery.
 * Tên service phải khớp với spring.application.name = "user-service".
 */
@FeignClient(name = "user-service")
public interface UserClient {

    @GetMapping(value = "/users/{id}")
    User getUserById(@PathVariable("id") Long id);
}
