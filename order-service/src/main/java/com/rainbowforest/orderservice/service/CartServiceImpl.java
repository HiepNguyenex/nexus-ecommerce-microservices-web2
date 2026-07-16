package com.rainbowforest.orderservice.service;

import com.rainbowforest.orderservice.domain.Item;
import com.rainbowforest.orderservice.domain.Product;
import com.rainbowforest.orderservice.feignclient.ProductClient;
import com.rainbowforest.orderservice.redis.CartRedisRepository;
import com.rainbowforest.orderservice.utilities.CartUtilities;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CartServiceImpl implements CartService {

    private static final Logger log = LoggerFactory.getLogger(CartServiceImpl.class);

    @Autowired
    private ProductClient productClient;

    @Autowired
    private CartRedisRepository cartRedisRepository;

    /**
     * Thêm sản phẩm vào giỏ hàng.
     * @CircuitBreaker: nếu product-catalog-service down (50% lỗi trong 10 request),
     *   circuit OPEN → gọi fallback thay vì throw exception.
     * @Retry: thử lại 3 lần với delay 500ms trước khi kích hoạt circuit breaker.
     */
    @Override
    @CircuitBreaker(name = "product-service", fallbackMethod = "addItemFallback")
    @Retry(name = "product-service")
    public void addItemToCart(String cartId, Long productId, Integer quantity, String size) {
        java.util.Map<String, Object> rawProduct = productClient.getRawProductById(productId);
        
        // Trích xuất giá cho dung tích được chọn
        BigDecimal finalPrice = null;
        List<java.util.Map<String, Object>> variants = (List<java.util.Map<String, Object>>) rawProduct.get("variants");
        if (variants != null) {
            for (java.util.Map<String, Object> variant : variants) {
                if (size != null && size.equalsIgnoreCase((String) variant.get("size"))) {
                    finalPrice = new BigDecimal(variant.get("price").toString());
                    break;
                }
            }
        }
        if (finalPrice == null) {
            finalPrice = new BigDecimal(rawProduct.get("price").toString());
        }

        Product product = new Product();
        product.setId(productId);
        product.setProductName((String) rawProduct.get("productName"));
        product.setPrice(finalPrice);

        Item item = new Item(quantity, product, finalPrice.multiply(BigDecimal.valueOf(quantity)), size);
        cartRedisRepository.addItemToCart(cartId, item);
        log.info("Đã thêm sản phẩm {} (dung tích: {}) vào giỏ hàng {} (số lượng: {})", productId, size, cartId, quantity);
    }

    /**
     * Fallback khi product-catalog-service không khả dụng.
     * KHÔNG lưu placeholder vào Redis để tránh ô nhiễm giỏ hàng.
     */
    public void addItemFallback(String cartId, Long productId, Integer quantity, String size, Exception ex) {
        log.warn("[Circuit Breaker OPEN] product-catalog-service không khả dụng. " +
                 "CartId: {}, ProductId: {}, Lỗi: {}", cartId, productId, ex.getMessage());
        // Không lưu item lỗi vào Redis — throw để caller biết thêm thất bại
        throw new RuntimeException("Dịch vụ catalog tạm thời không khả dụng. Vui lòng thử lại sau ít phút.");
    }

    @Override
    public List<Object> getCart(String cartId) {
        return (List<Object>) cartRedisRepository.getCart(cartId, Item.class);
    }

    @Override
    public void changeItemQuantity(String cartId, Long productId, Integer quantity, String size) {
        List<Item> cart = (List) cartRedisRepository.getCart(cartId, Item.class);
        for (Item item : cart) {
            String itemSize = item.getSelectedSize();
            if ((item.getProduct().getId()).equals(productId) && 
                ((size == null && itemSize == null) || (size != null && size.equalsIgnoreCase(itemSize)))) {
                cartRedisRepository.deleteItemFromCart(cartId, item);
                item.setQuantity(quantity);
                item.setSubTotal(item.getProduct().getPrice().multiply(BigDecimal.valueOf(quantity)));
                cartRedisRepository.addItemToCart(cartId, item);
            }
        }
    }

    @Override
    public void deleteItemFromCart(String cartId, Long productId, String size) {
        List<Item> cart = (List) cartRedisRepository.getCart(cartId, Item.class);
        for (Item item : cart) {
            String itemSize = item.getSelectedSize();
            if ((item.getProduct().getId()).equals(productId) && 
                ((size == null && itemSize == null) || (size != null && size.equalsIgnoreCase(itemSize)))) {
                cartRedisRepository.deleteItemFromCart(cartId, item);
            }
        }
    }

    @Override
    public boolean checkIfItemIsExist(String cartId, Long productId, String size) {
        List<Item> cart = (List) cartRedisRepository.getCart(cartId, Item.class);
        for (Item item : cart) {
            String itemSize = item.getSelectedSize();
            if ((item.getProduct().getId()).equals(productId) && 
                ((size == null && itemSize == null) || (size != null && size.equalsIgnoreCase(itemSize)))) {
                return true;
            }
        }
        return false;
    }

    @Override
    public List<Item> getAllItemsFromCart(String cartId) {
        return (List<Item>) (List<?>) cartRedisRepository.getCart(cartId, Item.class);
    }

    @Override
    public void deleteCart(String cartId) {
        cartRedisRepository.deleteCart(cartId);
    }
}
