package com.rainbowforest.recommendationservice.controller;

import com.rainbowforest.recommendationservice.feignClient.ProductClient;
import com.rainbowforest.recommendationservice.feignClient.UserClient;
import com.rainbowforest.recommendationservice.http.header.HeaderGenerator;
import com.rainbowforest.recommendationservice.model.Product;
import com.rainbowforest.recommendationservice.model.Recommendation;
import com.rainbowforest.recommendationservice.model.User;
import com.rainbowforest.recommendationservice.service.RecommendationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
public class RecommendationController {

    private static final Logger log = LoggerFactory.getLogger(RecommendationController.class);

    @Autowired
    private RecommendationService recommendationService;

    @Autowired
    private ProductClient productClient;

    @Autowired
    private UserClient userClient;
    
    @Autowired
    private HeaderGenerator headerGenerator;

    @GetMapping(value = "/recommendations")
    private ResponseEntity<List<Recommendation>> getAllRating(@RequestParam(value = "name", required = false) String productName){
        List<Recommendation> recommendations;
        if (productName != null && !productName.trim().isEmpty()) {
            recommendations = recommendationService.getAllRecommendationByProductName(productName);
        } else {
            recommendations = recommendationService.getAllRecommendations();
        }
        if(recommendations != null && !recommendations.isEmpty()) {
        	return new ResponseEntity<List<Recommendation>>(
        		recommendations,
        		headerGenerator.getHeadersForSuccessGetMethod(),
        		HttpStatus.OK);
        }
        return new ResponseEntity<List<Recommendation>>(
        		headerGenerator.getHeadersForError(),
        		HttpStatus.NOT_FOUND);
    }
    
    @PostMapping(value = "/{userId}/recommendations/{productId}")
    private ResponseEntity<Recommendation> saveRecommendations(
            @PathVariable ("userId") Long userId,
            @PathVariable ("productId") Long productId,
            @RequestParam ("rating") int rating,
            HttpServletRequest request){
    	
    	Product product = productClient.getProductById(productId);
		User user = userClient.getUserById(userId);
    	
		if(product != null && user != null) {
			try {
				Recommendation recommendation = new Recommendation();
				recommendation.setProduct(product);
				recommendation.setUser(user);
				recommendation.setRating(rating);
				recommendationService.saveRecommendation(recommendation);
				return new ResponseEntity<Recommendation>(
						recommendation,
						headerGenerator.getHeadersForSuccessPostMethod(request, recommendation.getId()),
						HttpStatus.CREATED);
			}catch (Exception e) {
				log.error("Failed to create recommendation", e);
				throw new RuntimeException("Failed to create recommendation", e);
			}
		}
        return new ResponseEntity<Recommendation>(
        		headerGenerator.getHeadersForError(),
        		HttpStatus.BAD_REQUEST);
    }

    @DeleteMapping(value = "/recommendations/{id}")
    private ResponseEntity<Void> deleteRecommendations(@PathVariable("id") Long id){
    	Recommendation recommendation = recommendationService.getRecommendationById(id);
    	if(recommendation != null) {
    		try {
    			recommendationService.deleteRecommendation(id);
    			return new ResponseEntity<Void>(
    					headerGenerator.getHeadersForSuccessGetMethod(),
    					HttpStatus.OK);
    		}catch (Exception e) {
    			log.error("Failed to delete recommendation id={}", id, e);
				throw new RuntimeException("Failed to delete recommendation", e);
    		}
    	}
    	return new ResponseEntity<Void>(
    			headerGenerator.getHeadersForError(),
    			HttpStatus.NOT_FOUND);
    }
}
