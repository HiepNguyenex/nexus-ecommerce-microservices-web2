package com.rainbowforest.orderservice.feignclient;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.rainbowforest.orderservice.domain.Product;

/**
 * FeignClient gọi product-catalog-service qua Eureka Service Discovery.
 * Không hard-code URL — Eureka tự resolve địa chỉ theo service name "product-catalog-service".
 * Nếu có nhiều instance, Ribbon/LoadBalancer sẽ tự cân bằng tải.
 */
@FeignClient(name = "product-catalog-service")
public interface ProductClient {

    @GetMapping(value = "/products/{id}")
    Product getProductById(@PathVariable(value = "id") Long productId);

}
