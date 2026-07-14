package com.rainbowforest.productcatalogservice.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.rainbowforest.productcatalogservice.entity.Product;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    public List<Product> findAllByCategory(String category);
    public List<Product> findAllByProductName(String name);

    @Query("SELECT p FROM Product p WHERE " +
           "(:category IS NULL OR :category = '' OR :category = 'Tất Cả' OR p.category = :category) AND " +
           "(:search IS NULL OR :search = '' OR LOWER(p.productName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.discription) LIKE LOWER(CONCAT('%', :search, '%')))")
    public Page<Product> searchProducts(
            @Param("category") String category,
            @Param("search") String search,
            Pageable pageable);
}
