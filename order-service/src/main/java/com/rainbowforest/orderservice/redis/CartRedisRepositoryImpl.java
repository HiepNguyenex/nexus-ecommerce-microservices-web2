package com.rainbowforest.orderservice.redis;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Repository;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

@Repository
public class CartRedisRepositoryImpl implements CartRedisRepository{

    private ObjectMapper objectMapper = new ObjectMapper();
    private ConcurrentHashMap<String, Set<String>> storage = new ConcurrentHashMap<>();

    @Override
    public void addItemToCart(String key, Object item) {
        try {
            String jsonObject = objectMapper.writeValueAsString(item);
            storage.computeIfAbsent(key, k -> new CopyOnWriteArraySet<>()).add(jsonObject);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
    }

    @Override
    public Collection<Object> getCart(String key, Class type) {
        Collection<Object> cart = new ArrayList<>();
        Set<String> members = storage.get(key);
        if (members != null) {
            for (String smember : members) {
                try {
                    cart.add(objectMapper.readValue(smember, type));
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
        return cart;
    }

    @Override
    public void deleteItemFromCart(String key, Object item) {
        try {
            String itemCart = objectMapper.writeValueAsString(item);
            Set<String> members = storage.get(key);
            if (members != null) {
                members.remove(itemCart);
            }
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void deleteCart(String key) {
        storage.remove(key);
    }
}
