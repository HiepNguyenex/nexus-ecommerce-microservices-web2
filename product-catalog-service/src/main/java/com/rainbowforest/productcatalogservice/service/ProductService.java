package com.rainbowforest.productcatalogservice.service;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.rainbowforest.productcatalogservice.entity.Product;

public interface ProductService {
    public List<Product> getAllProduct();
    public List<Product> getAllProductByCategory(String category);
    public Product getProductById(Long id);
    public List<Product> getAllProductsByName(String name);
    public Product addProduct(Product product);
    public void deleteProduct(Long productId);
    public Page<Product> getProductsPaged(String category, String search, Pageable pageable);
}
