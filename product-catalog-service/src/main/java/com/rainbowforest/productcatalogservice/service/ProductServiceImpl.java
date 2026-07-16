package com.rainbowforest.productcatalogservice.service;

import com.rainbowforest.productcatalogservice.entity.Product;
import com.rainbowforest.productcatalogservice.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
@Transactional
public class ProductServiceImpl implements ProductService {

    private static final Logger log = LoggerFactory.getLogger(ProductServiceImpl.class);

    @Autowired
    private ProductRepository productRepository;

    /**
     * Cache toàn bộ danh sách sản phẩm vào Redis với key "products::all".
     * TTL = 5 phút (cấu hình trong application.properties).
     * Cache sẽ bị xóa khi có thêm/xóa sản phẩm.
     */
    @Override
    @Cacheable(value = "products", key = "'all'")
    public List<Product> getAllProduct() {
        log.info("[CACHE MISS] getAllProduct — truy vấn từ database");
        return productRepository.findAll();
    }

    /**
     * Cache danh sách sản phẩm theo category.
     * Key: "products::category:{category}"
     */
    @Override
    @Cacheable(value = "products", key = "'category:' + #category")
    public List<Product> getAllProductByCategory(String category) {
        log.info("[CACHE MISS] getAllProductByCategory({}) — truy vấn từ database", category);
        return productRepository.findAllByCategory(category);
    }

    /**
     * Cache sản phẩm theo id.
     * Key: "products::{id}"
     */
    @Override
    @Cacheable(value = "products", key = "#id")
    public Product getProductById(Long id) {
        log.info("[CACHE MISS] getProductById({}) — truy vấn từ database", id);
        return productRepository.findById(id).orElse(null);
    }

    /**
     * Cache sản phẩm theo tên.
     * Key: "products::name:{name}"
     */
    @Override
    @Cacheable(value = "products", key = "'name:' + #name")
    public List<Product> getAllProductsByName(String name) {
        log.info("[CACHE MISS] getAllProductsByName({}) — truy vấn từ database", name);
        return productRepository.findAllByProductName(name);
    }

    /**
     * Khi thêm sản phẩm mới → xóa toàn bộ cache products để đảm bảo tính nhất quán.
     */
    @Override
    @Caching(evict = {
        @CacheEvict(value = "products", key = "'all'"),
        @CacheEvict(value = "products", allEntries = true)
    })
    public Product addProduct(Product product) {
        log.info("[CACHE EVICT] addProduct — xóa cache products");
        return productRepository.save(product);
    }

    /**
     * Khi xóa sản phẩm → xóa toàn bộ cache products.
     */
    @Override
    @CacheEvict(value = "products", allEntries = true)
    public void deleteProduct(Long productId) {
        log.info("[CACHE EVICT] deleteProduct({}) — xóa cache products", productId);
        productRepository.deleteById(productId);
    }

    @Override
    public Page<Product> getProductsPaged(String category, String search, Pageable pageable) {
        log.info("getProductsPaged(category={}, search={}) — truy vấn phân trang", category, search);
        return productRepository.searchProducts(category, search, pageable);
    }

    @Override
    @CacheEvict(value = "products", allEntries = true)
    public void reduceStock(Long productId, int quantity) {
        Product product = productRepository.findById(productId).orElse(null);
        if (product != null) {
            int oldQty = product.getAvailability();
            int newQty = Math.max(0, oldQty - quantity);
            product.setAvailability(newQty);
            productRepository.save(product);
            log.info("[Saga Sync] Đã cập nhật tồn kho sản phẩm ID {}: {} -> {} (trừ {}) và xóa cache",
                productId, oldQty, newQty, quantity);
        }
    }
}
