package com.rainbowforest.productcatalogservice.config;

import com.rainbowforest.productcatalogservice.entity.Product;
import com.rainbowforest.productcatalogservice.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private ProductRepository productRepository;

    @Override
    public void run(String... args) throws Exception {
        if (productRepository.count() == 0) {
            System.out.println(">> Product Catalog database is empty. Starting auto-seed...");

            Product p1 = new Product();
            p1.setProductName("Smartphone Galaxy S21");
            p1.setPrice(BigDecimal.valueOf(799.99));
            p1.setDiscription("Samsung Galaxy S21 5G 128GB");
            p1.setCategory("Electronics");
            p1.setAvailability(10);

            Product p2 = new Product();
            p2.setProductName("MacBook Pro 13");
            p2.setPrice(BigDecimal.valueOf(1299.99));
            p2.setDiscription("Apple MacBook Pro 13-inch M1 8GB 256GB");
            p2.setCategory("Electronics");
            p2.setAvailability(5);

            Product p3 = new Product();
            p3.setProductName("Leather Jacket");
            p3.setPrice(BigDecimal.valueOf(120.00));
            p3.setDiscription("Genuine black leather jacket");
            p3.setCategory("Clothing");
            p3.setAvailability(15);

            Product p4 = new Product();
            p4.setProductName("Running Shoes");
            p4.setPrice(BigDecimal.valueOf(85.50));
            p4.setDiscription("Comfortable running sports shoes");
            p4.setCategory("Clothing");
            p4.setAvailability(20);

            Product p5 = new Product();
            p5.setProductName("Java Programming Book");
            p5.setPrice(BigDecimal.valueOf(45.00));
            p5.setDiscription("Introduction to Java Programming 11th Edition");
            p5.setCategory("Books");
            p5.setAvailability(30);

            productRepository.saveAll(Arrays.asList(p1, p2, p3, p4, p5));
            System.out.println(">> Database product_catalog seeded successfully with 5 products!");
        } else {
            System.out.println(">> Product Catalog database already has data. Seeding skipped.");
        }
    }
}
