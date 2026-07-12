package com.rainbowforest.recommendationservice.feignClient;

import com.rainbowforest.recommendationservice.model.Product;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * FeignClient gọi product-catalog-service qua Eureka Service Discovery.
 * Không hard-code URL — cho phép scale và load balance tự động.
 */
@FeignClient(name = "product-catalog-service")
public interface ProductClient {

    @GetMapping(value = "/products/{id}")
    Product getProductById(@PathVariable(value = "id") Long productId);
}
