package com.rainbowforest.orderservice.controller;

import com.rainbowforest.orderservice.http.header.HeaderGenerator;
import com.rainbowforest.orderservice.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import jakarta.servlet.http.HttpServletRequest;

@RestController
public class CartController {

    @Autowired
    CartService cartService;
    
    @Autowired
    private HeaderGenerator headerGenerator;

    private String resolveCartId(String userName, String cookieId) {
        if (userName != null && !userName.isEmpty()) {
            return userName;
        }
        return cookieId;
    }

    @GetMapping (value = "/cart")
    public ResponseEntity<List<Object>> getCart(
            @RequestHeader(value = "X-User-Name", required = false) String userName,
            @RequestHeader(value = "Cookie", required = false) String cookieId){
        String cartId = resolveCartId(userName, cookieId);
        if (cartId == null || cartId.isEmpty()) {
            return new ResponseEntity<List<Object>>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.BAD_REQUEST);
        }
        List<Object> cart = cartService.getCart(cartId);
        if(!cart.isEmpty()) {
        	return new ResponseEntity<List<Object>>(
        			cart,
        			headerGenerator.getHeadersForSuccessGetMethod(),
        			HttpStatus.OK);
        }
    	return new ResponseEntity<List<Object>>(
    			headerGenerator.getHeadersForError(),
    			HttpStatus.NOT_FOUND);  
    }

    @PostMapping(value = "/cart")
    public ResponseEntity<List<Object>> addItemToCart(
            @RequestParam("productId") Long productId,
            @RequestParam("quantity") Integer quantity,
            @RequestParam(value = "size", required = false, defaultValue = "100ml") String size,
            @RequestHeader(value = "X-User-Name", required = false) String userName,
            @RequestHeader(value = "Cookie", required = false) String cookieId,
            HttpServletRequest request) {
        String cartId = resolveCartId(userName, cookieId);
        if (cartId == null || cartId.isEmpty()) {
            return new ResponseEntity<List<Object>>(
                    headerGenerator.getHeadersForError(),
                    HttpStatus.BAD_REQUEST);
        }
        List<Object> cart = cartService.getCart(cartId);
        if(cart != null) {
        	if(cart.isEmpty()){
        		cartService.addItemToCart(cartId, productId, quantity, size);
        	}else{
        		if(cartService.checkIfItemIsExist(cartId, productId, size)){
        			cartService.changeItemQuantity(cartId, productId, quantity, size);
        		}else {
        			cartService.addItemToCart(cartId, productId, quantity, size);
        		}
        	}
        	return new ResponseEntity<List<Object>>(
        			cartService.getCart(cartId), // return freshly updated cart
        			headerGenerator.getHeadersForSuccessPostMethod(request, cartId),
        			HttpStatus.CREATED);
        }
        return new ResponseEntity<List<Object>>(
        		headerGenerator.getHeadersForError(),
        		HttpStatus.BAD_REQUEST);
    }

    @DeleteMapping(value = "/cart")
    public ResponseEntity<Void> removeItemFromCart(
            @RequestParam("productId") Long productId,
            @RequestParam(value = "size", required = false, defaultValue = "100ml") String size,
            @RequestHeader(value = "X-User-Name", required = false) String userName,
            @RequestHeader(value = "Cookie", required = false) String cookieId){
        String cartId = resolveCartId(userName, cookieId);
        if (cartId == null || cartId.isEmpty()) {
            return new ResponseEntity<Void>(HttpStatus.BAD_REQUEST);
        }
    	List<Object> cart = cartService.getCart(cartId);
    	if(cart != null) {
    		cartService.deleteItemFromCart(cartId, productId, size);
            return new ResponseEntity<Void>(
            		headerGenerator.getHeadersForSuccessGetMethod(),
            		HttpStatus.OK);
    	}
        return new ResponseEntity<Void>(
        		headerGenerator.getHeadersForError(),
        		HttpStatus.NOT_FOUND);
    }
}
