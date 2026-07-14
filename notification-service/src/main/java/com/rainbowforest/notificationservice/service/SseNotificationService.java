package com.rainbowforest.notificationservice.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SseNotificationService {
    private static final Logger log = LoggerFactory.getLogger(SseNotificationService.class);
    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();

    public SseEmitter createEmitter(String username) {
        log.info("Creating new SSE Emitter for user: {}", username);
        SseEmitter emitter = new SseEmitter(24 * 60 * 60 * 1000L); // 24 hours
        
        emitters.put(username, emitter);
        
        emitter.onCompletion(() -> {
            log.info("SSE connection completed for user: {}", username);
            emitters.remove(username);
        });
        emitter.onTimeout(() -> {
            log.warn("SSE connection timeout for user: {}", username);
            emitters.remove(username);
        });
        emitter.onError((e) -> {
            log.error("SSE connection error for user: {}", username, e);
            emitters.remove(username);
        });
        
        try {
            emitter.send(SseEmitter.event().name("INIT").data("Connected successfully"));
        } catch (Exception e) {
            emitters.remove(username);
        }
        
        return emitter;
    }

    public void sendNotification(String username, String eventName, Object data) {
        SseEmitter emitter = emitters.get(username);
        if (emitter != null) {
            try {
                log.info("Sending SSE notification to user: {} [Event: {}]", username, eventName);
                emitter.send(SseEmitter.event().name(eventName).data(data));
            } catch (Exception e) {
                log.warn("Failed to send SSE notification to user: {}, removing emitter", username);
                emitters.remove(username);
            }
        } else {
            log.debug("No active SSE Emitter for user: {}", username);
        }
    }
}
