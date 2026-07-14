package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.entity.Product;
import com.rainbowforest.productcatalogservice.http.header.HeaderGenerator;
import com.rainbowforest.productcatalogservice.service.ProductService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.servlet.http.HttpServletRequest;
import java.io.File;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminProductController {

    private static final Logger log = LoggerFactory.getLogger(AdminProductController.class);

    @Autowired
    private ProductService productService;
    
    @Autowired
    private HeaderGenerator headerGenerator;

    @PostMapping(value = "/products/upload")
    public ResponseEntity<Map<String, String>> uploadProductImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        try {
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            String targetDirPath = "D:/Bai Tap/java-project/e-commerce-microservices-master/web-client-react/public/uploads/";
            File targetDir = new File(targetDirPath);
            if (!targetDir.exists()) {
                targetDir.mkdirs();
            }
            File destFile = new File(targetDir, fileName);
            file.transferTo(destFile);

            Map<String, String> response = new HashMap<>();
            response.put("url", "/uploads/" + fileName);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            log.error("Failed to upload image", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping(value = "/products")
    private ResponseEntity<Product> addProduct(@RequestBody Product product, HttpServletRequest request){
    	if(product != null) {
    		try {
    			productService.addProduct(product);
    	        return new ResponseEntity<Product>(
    	        		product,
    	        		headerGenerator.getHeadersForSuccessPostMethod(request, product.getId()),
    	        		HttpStatus.CREATED);
    		}catch (Exception e) {
				log.error("Failed to add product", e);
				throw new RuntimeException("Failed to add product", e);
			}
    	}
    	return new ResponseEntity<Product>(
    			headerGenerator.getHeadersForError(),
    			HttpStatus.BAD_REQUEST);       
    }
    
    @DeleteMapping(value = "/products/{id}")
    private ResponseEntity<Void> deleteProduct(@PathVariable("id") Long id){
    	Product product = productService.getProductById(id);
    	if(product != null) {
    		try {
    			productService.deleteProduct(id);
    	        return new ResponseEntity<Void>(
    	        		headerGenerator.getHeadersForSuccessGetMethod(),
    	        		HttpStatus.OK);
    		}catch (Exception e) {
				log.error("Failed to delete product id={}", id, e);
				throw new RuntimeException("Failed to delete product", e);
			}
    	}
    	return new ResponseEntity<Void>(headerGenerator.getHeadersForError(), HttpStatus.NOT_FOUND);      
    }
}
