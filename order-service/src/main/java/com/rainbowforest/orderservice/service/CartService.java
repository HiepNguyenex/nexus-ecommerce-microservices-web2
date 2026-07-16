package com.rainbowforest.orderservice.service;

import java.util.List;

import com.rainbowforest.orderservice.domain.Item;

public interface CartService {

    public void addItemToCart(String cartId, Long productId, Integer quantity, String size);
    public List<Object> getCart(String cartId);
    public void changeItemQuantity(String cartId, Long productId, Integer quantity, String size);
    public void deleteItemFromCart(String cartId, Long productId, String size);
    public boolean checkIfItemIsExist(String cartId, Long productId, String size);
    public List<Item> getAllItemsFromCart(String cartId);
    public void deleteCart(String cartId);
}
