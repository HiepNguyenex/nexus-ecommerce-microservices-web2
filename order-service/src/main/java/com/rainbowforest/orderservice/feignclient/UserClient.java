package com.rainbowforest.orderservice.feignclient;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.rainbowforest.orderservice.domain.User;

/**
 * FeignClient gọi user-service qua Eureka Service Discovery.
 * Tên service "user-service" phải khớp với spring.application.name trong user-service.
 */
@FeignClient(name = "user-service")
public interface UserClient {

    @GetMapping(value = "/users/{id}")
    User getUserById(@PathVariable("id") Long id);
}
