package com.rainbowforest.orderservice.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import redis.embedded.RedisServer;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.io.IOException;

@Configuration
public class RedisConfig {

    private static final Logger log = LoggerFactory.getLogger(RedisConfig.class);

    @Value("${spring.data.redis.host:localhost}")
    private String redisHost;

    @Value("${spring.data.redis.port:6379}")
    private int redisPort;

    private RedisServer redisServer;

    @PostConstruct
    public void startEmbeddedRedis() throws IOException {
        try {
            redisServer = new RedisServer(redisPort);
            redisServer.start();
            log.info("Embedded Redis started on {}:{}", redisHost, redisPort);
        } catch (Exception e) {
            log.warn("Could not start embedded Redis (probably already running on {}:{}): {}",
                redisHost, redisPort, e.getMessage());
        }
    }

    @PreDestroy
    public void stopEmbeddedRedis() {
        if (redisServer != null && redisServer.isActive()) {
            try {
                redisServer.stop();
                log.info("Embedded Redis stopped");
            } catch (Exception e) {
                log.warn("Failed to stop embedded Redis: {}", e.getMessage());
            }
        }
    }

    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        RedisStandaloneConfiguration config = new RedisStandaloneConfiguration(redisHost, redisPort);
        return new LettuceConnectionFactory(config);
    }

    @Bean
    public StringRedisTemplate stringRedisTemplate(RedisConnectionFactory factory) {
        return new StringRedisTemplate(factory);
    }
}
