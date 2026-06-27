package com.rainbowforest.orderservice.redis;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Repository
public class CartRedisRepositoryImpl implements CartRedisRepository {

    private static final Logger log = LoggerFactory.getLogger(CartRedisRepositoryImpl.class);
    private static final String CART_KEY_PREFIX = "cart:";

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public CartRedisRepositoryImpl(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    private String redisKey(String key) {
        return CART_KEY_PREFIX + key;
    }

    @Override
    public void addItemToCart(String key, Object item) {
        try {
            String json = objectMapper.writeValueAsString(item);
            redisTemplate.opsForSet().add(redisKey(key), json);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize item for cart {}", key, e);
        }
    }

    @Override
    public Collection<Object> getCart(String key, Class type) {
        Collection<Object> cart = new ArrayList<>();
        Set<String> members = redisTemplate.opsForSet().members(redisKey(key));
        if (members != null) {
            for (String json : members) {
                try {
                    cart.add(objectMapper.readValue(json, type));
                } catch (Exception e) {
                    log.error("Failed to deserialize cart item: {}", json, e);
                }
            }
        }
        return cart;
    }

    @Override
    public void deleteItemFromCart(String key, Object item) {
        try {
            String json = objectMapper.writeValueAsString(item);
            redisTemplate.opsForSet().remove(redisKey(key), json);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize item for delete", e);
        }
    }

    @Override
    public void deleteCart(String key) {
        redisTemplate.delete(redisKey(key));
    }

    public Long getCartSize(String key) {
        Long size = redisTemplate.opsForSet().size(redisKey(key));
        return size == null ? 0L : size;
    }

    public List<String> getAllCartKeys() {
        Set<String> keys = redisTemplate.keys(CART_KEY_PREFIX + "*");
        return keys == null ? new ArrayList<>() : keys.stream()
            .map(k -> k.substring(CART_KEY_PREFIX.length()))
            .collect(Collectors.toList());
    }
}
