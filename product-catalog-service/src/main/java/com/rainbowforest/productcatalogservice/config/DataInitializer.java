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
            p1.setProductName("Le Labo Santal 33");
            p1.setPrice(BigDecimal.valueOf(310.00));
            p1.setDiscription("Woody aromatic fragrance with cardamom, iris, and violet.");
            p1.setCategory("Unisex");
            p1.setAvailability(10);

            Product p2 = new Product();
            p2.setProductName("Chanel No. 5");
            p2.setPrice(BigDecimal.valueOf(165.00));
            p2.setDiscription("The legendary aldehyde floral bouquet in its classic bottle.");
            p2.setCategory("Women");
            p2.setAvailability(5);

            Product p3 = new Product();
            p3.setProductName("Dior Sauvage");
            p3.setPrice(BigDecimal.valueOf(145.00));
            p3.setDiscription("A radically fresh composition, raw and noble all at once.");
            p3.setCategory("Men");
            p3.setAvailability(15);

            Product p4 = new Product();
            p4.setProductName("Byredo Gypsy Water");
            p4.setPrice(BigDecimal.valueOf(200.00));
            p4.setDiscription("A glamorization of the Romany lifestyle, earthy and woody.");
            p4.setCategory("Unisex");
            p4.setAvailability(20);

            Product p5 = new Product();
            p5.setProductName("Bleu de Chanel");
            p5.setPrice(BigDecimal.valueOf(150.00));
            p5.setDiscription("An olfactory tribute to masculine freedom, woody aromatic.");
            p5.setCategory("Men");
            p5.setAvailability(30);

            productRepository.saveAll(Arrays.asList(p1, p2, p3, p4, p5));
            System.out.println(">> Database product_catalog seeded successfully with 5 products!");
        } else {
            System.out.println(">> Product Catalog database already has data. Seeding skipped.");
        }
    }
}
