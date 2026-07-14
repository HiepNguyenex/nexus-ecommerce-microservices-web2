package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.entity.Product;
import com.rainbowforest.productcatalogservice.http.header.HeaderGenerator;
import com.rainbowforest.productcatalogservice.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
public class ProductController {

    @Autowired
    private ProductService productService;
    
    @Autowired
    private HeaderGenerator headerGenerator;

    @GetMapping(value = "/products")
    public ResponseEntity<?> getProducts(
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "page", required = false) Integer page,
            @RequestParam(value = "size", required = false) Integer size) {

        if (page != null) {
            int pageSize = (size != null) ? size : 8;
            org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, pageSize);
            org.springframework.data.domain.Page<Product> pagedResult = productService.getProductsPaged(category, search, pageable);
            return new ResponseEntity<>(
                    pagedResult,
                    headerGenerator.getHeadersForSuccessGetMethod(),
                    HttpStatus.OK);
        }

        List<Product> products;
        if (category != null && !category.isEmpty() && !category.equals("Tất Cả")) {
            products = productService.getAllProductByCategory(category);
        } else if (search != null && !search.isEmpty()) {
            products = productService.getAllProductsByName(search);
        } else {
            products = productService.getAllProduct();
        }

        if (!products.isEmpty()) {
            return new ResponseEntity<>(
                    products,
                    headerGenerator.getHeadersForSuccessGetMethod(),
                    HttpStatus.OK);
        }
        return new ResponseEntity<>(
                headerGenerator.getHeadersForError(),
                HttpStatus.NOT_FOUND);
    }

    @GetMapping (value = "/products/{id}")
    public ResponseEntity<Product> getOneProductById(@PathVariable ("id") long id){
        Product product =  productService.getProductById(id);
        if(product != null) {
        	return new ResponseEntity<Product>(
        			product,
        			headerGenerator.getHeadersForSuccessGetMethod(),
        			HttpStatus.OK);
        }
        return new ResponseEntity<Product>(
        		headerGenerator.getHeadersForError(),
        		HttpStatus.NOT_FOUND);
    }

    @GetMapping (value = "/products", params = "name")
    public ResponseEntity<List<Product>> getAllProductsByName(@RequestParam ("name") String name){
        List<Product> products =  productService.getAllProductsByName(name);
        if(!products.isEmpty()) {
        	return new ResponseEntity<List<Product>>(
        			products,
        			headerGenerator.getHeadersForSuccessGetMethod(),
        			HttpStatus.OK);
        }
        return new ResponseEntity<List<Product>>(
        		headerGenerator.getHeadersForError(),
        		HttpStatus.NOT_FOUND);
    }
}
