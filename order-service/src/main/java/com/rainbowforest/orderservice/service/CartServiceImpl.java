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
    public void addItemToCart(String cartId, Long productId, Integer quantity) {
        Product product = productClient.getProductById(productId);
        Item item = new Item(quantity, product, CartUtilities.getSubTotalForItem(product, quantity));
        cartRedisRepository.addItemToCart(cartId, item);
        log.info("Đã thêm sản phẩm {} vào giỏ hàng {} (số lượng: {})", productId, cartId, quantity);
    }

    /**
     * Fallback khi product-catalog-service không khả dụng.
     * Trả về sản phẩm placeholder để user biết service tạm thời gián đoạn.
     */
    public void addItemFallback(String cartId, Long productId, Integer quantity, Exception ex) {
        log.warn("[Circuit Breaker OPEN] product-catalog-service không khả dụng. " +
                 "CartId: {}, ProductId: {}, Lỗi: {}", cartId, productId, ex.getMessage());
        // Tạo sản phẩm placeholder để tránh crash
        Product fallbackProduct = new Product();
        fallbackProduct.setId(productId);
        fallbackProduct.setProductName("Sản phẩm tạm thời không khả dụng");
        fallbackProduct.setPrice(BigDecimal.ZERO);
        Item item = new Item(quantity, fallbackProduct, BigDecimal.ZERO);
        cartRedisRepository.addItemToCart(cartId, item);
        log.warn("[Circuit Breaker] Đã thêm sản phẩm placeholder vào giỏ hàng {}", cartId);
    }

    @Override
    public List<Object> getCart(String cartId) {
        return (List<Object>) cartRedisRepository.getCart(cartId, Item.class);
    }

    @Override
    public void changeItemQuantity(String cartId, Long productId, Integer quantity) {
        List<Item> cart = (List) cartRedisRepository.getCart(cartId, Item.class);
        for (Item item : cart) {
            if ((item.getProduct().getId()).equals(productId)) {
                cartRedisRepository.deleteItemFromCart(cartId, item);
                item.setQuantity(quantity);
                item.setSubTotal(CartUtilities.getSubTotalForItem(item.getProduct(), quantity));
                cartRedisRepository.addItemToCart(cartId, item);
            }
        }
    }

    @Override
    public void deleteItemFromCart(String cartId, Long productId) {
        List<Item> cart = (List) cartRedisRepository.getCart(cartId, Item.class);
        for (Item item : cart) {
            if ((item.getProduct().getId()).equals(productId)) {
                cartRedisRepository.deleteItemFromCart(cartId, item);
            }
        }
    }

    @Override
    public boolean checkIfItemIsExist(String cartId, Long productId) {
        List<Item> cart = (List) cartRedisRepository.getCart(cartId, Item.class);
        for (Item item : cart) {
            if ((item.getProduct().getId()).equals(productId)) {
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
